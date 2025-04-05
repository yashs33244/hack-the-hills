import { useState } from "react";
export default function Component() {
    const [count, setCount] = useState(0);

    const handleCount = () => {
        setCount(count + 1);
    }

    return (
        <div>
            <h1 onClick={handleCount}>{count}</h1>
        </div>
    );
}
