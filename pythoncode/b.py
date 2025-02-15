import cv2
import json
import base58
import base64
import qrcode
import numpy as np
import logging
import time
import os
import pickle
import RPi.GPIO as GPIO
from pyzbar.pyzbar import decode
from picamera2 import Picamera2
from solana.rpc.api import Client
from solana.transaction import Transaction
from solana.system_program import TransferParams, transfer
from solana.keypair import Keypair
from solana.publickey import PublicKey
from decimal import Decimal
from gtts import gTTS
import face_recognition

def speak(text, accent="co.uk"):
    tts = gTTS(text=text, lang='en', tld=accent)
    tts.save("voice.mp3")
    os.system("mpg321 voice.mp3")
    
class SecureTransactionSigner:
    def __init__(self, rpc_url: str = "https://api.devnet.solana.com"):
        self.client = Client(rpc_url)
        self.logger = logging.getLogger(__name__)
        self.picam2 = Picamera2()
        self.picam2.configure(self.picam2.create_preview_configuration(main={"format": 'XRGB8888', "size": (1280, 720)}))
        self.picam2.start()
        
        # Load private key from wallet.json
        with open("wallet.json", "r") as f:
            wallet_data = json.load(f)
        self.sender_private = wallet_data["privateKey"]  # Store private key

        # GPIO setup
        GPIO.setmode(GPIO.BCM)
        self.FACE_LED = 17  
        self.QR_LED = 27    
        GPIO.setup(self.FACE_LED, GPIO.OUT)
        GPIO.setup(self.QR_LED, GPIO.OUT)
        
        # Load face encodings
        with open("encodings.pickle", "rb") as f:
            data = pickle.loads(f.read())
        self.known_face_encodings = data["encodings"]
        self.known_face_names = data["names"]


    
    def validate_amount(self, amount: float) -> int:
        if not isinstance(amount, (int, float, Decimal)) or amount <= 0:
            raise ValueError("Invalid amount")
        return int(amount * 10**9)

    def create_signed_transaction(self, recipient_address: str, amount_sol: float) -> str:
        try:
            amount_lamports = self.validate_amount(amount_sol)
            sender_keypair = Keypair.from_secret_key(base58.b58decode(self.sender_private))  # Use dynamic private key
            recipient_pubkey = PublicKey(recipient_address)
            recent_blockhash = self.client.get_latest_blockhash().value.blockhash
            
            transaction = Transaction()
            transaction.add(transfer(TransferParams(from_pubkey=sender_keypair.public_key, to_pubkey=recipient_pubkey, lamports=amount_lamports)))
            transaction.recent_blockhash = str(recent_blockhash)
            transaction.fee_payer = sender_keypair.public_key
            transaction.sign(sender_keypair)
        
            return base64.b64encode(transaction.serialize()).decode('utf-8')
        except Exception as e:
            self.logger.error(f"Transaction failed: {e}")
            raise


    def authenticate_face(self):
        speak("Starting facial authentication. Please look at the camera.")
        face_detected = False
        
        while not face_detected:
            frame = self.picam2.capture_array()
            resized_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
            rgb_resized_frame = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2RGB)
            
            face_locations = face_recognition.face_locations(rgb_resized_frame)
            face_encodings = face_recognition.face_encodings(rgb_resized_frame, face_locations)
            
            for face_encoding in face_encodings:
                matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                
                if matches[best_match_index]:
                    face_detected = True
                    GPIO.output(self.FACE_LED, GPIO.HIGH)
                    speak("Face verified successfully. Proceeding to QR scanning.")
                    return True
        return False
    
    def scan_qr_code(self):
        speak("Please show the QR code to the camera.")
        cv2.namedWindow("QR Scanner", cv2.WINDOW_NORMAL)
        
        while True:
            frame = self.picam2.capture_array()
            gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            decoded_objects = decode(gray_frame)
            
            for obj in decoded_objects:
                try:
                    qr_data = json.loads(obj.data.decode('utf-8'))
                    speak("QR code successfully scanned.")
                    cv2.destroyAllWindows()
                    self.picam2.stop()
                    return qr_data
                except json.JSONDecodeError:
                    continue
            
            cv2.imshow("QR Scanner", frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        self.picam2.stop()
        cv2.destroyAllWindows()
        return None
    
    def generate_qr_code(self, data):
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(json.dumps(data))
        qr.make(fit=True)
        
        qr_image = qr.make_image(fill="black", back_color="white")
        qr_array = np.array(qr_image)

        qr_opencv = cv2.cvtColor(qr_array.astype(np.uint8) * 255, cv2.COLOR_GRAY2BGR)
        cv2.imshow("Generated QR Code", qr_opencv)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    signer = SecureTransactionSigner()  # Private key is now loaded dynamically
    
    if signer.authenticate_face():
        print("Scanning QR Code...")
        qr_data = signer.scan_qr_code()
        
        if qr_data:
            recipient_public = qr_data.get("recipient")
            amount = float(qr_data.get("amount", 0))
            
            if recipient_public and amount:
                signed_txn = signer.create_signed_transaction(recipient_public, amount)
                print("Signed Transaction (base64):", signed_txn)
                qr_payload = {"signed_transaction": signed_txn, "recipient": recipient_public}
                signer.generate_qr_code(qr_payload)
            else:
                print("Invalid QR code data")
    else:
        print("Face authentication failed.")
    
    GPIO.cleanup()


