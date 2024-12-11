'use client'

import { Button } from '@nextui-org/react';

export default function ClientButton() {
    async function getItems() {
        const response = await fetch('https://localhost:8000/products/');
        const data = await response.json();
        console.log(data);
        return data;
}


    return (
        <div>
            <Button onPress={getItems}>
                Test
            </Button>
        </div>
    )
}
