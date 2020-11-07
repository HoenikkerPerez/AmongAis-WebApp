# WS proxy server

import websockets as ws
import asyncio
import telnetlib
TCP_IP = 'margot.di.unipi.it'
TCP_PORT = 8421
TIMEOUT = 100000

#with telnetlib.Telnet(TCP_IP, TCP_PORT, TIMEOUT) as tn:
print("TELNET connected")
async def echo(websocket, path):
    async for message in websocket:
        print("WS resv:", message)
        """
        encoded = message.encode()
        print("Encoded message:")
        print(encoded)
        tn.write(encoded)
        print("Waiting for response...")
        resp = tn.read_some()
        """
        resp = "OK"
        print("Response is: ")
        print(resp)
        await websocket.send(resp)

asyncio.get_event_loop().run_until_complete(
    ws.serve(echo, '127.0.0.1', 8765))
asyncio.get_event_loop().run_forever()