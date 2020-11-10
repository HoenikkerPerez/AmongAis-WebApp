import websockets as ws
import asyncio
import telnetlib
TCP_IP = 'margot.di.unipi.it'
TCP_PORT = 8421
TIMEOUT = 100000
ENDOFMAP = b'\n\xc2\xabENDOFMAP\xc2\xbb\n'
ENDOFSTATUS = b'\n\xc2\xabENDOFSTATUS\xc2\xbb\n'

with telnetlib.Telnet(TCP_IP, TCP_PORT, TIMEOUT) as tn:
    print("TELNET connected")
    async def echo(websocket, path):
        async for message in websocket:
            resp = ""
            print("WS resv:", message)
            tokens = message.split()
            encoded = message.encode()
            print("Encoded message:", encoded)
            tn.write(encoded)
            # print("Waiting for response...")
            if(tokens[1] == "LOOK"):
                resp = tn.read_until(ENDOFMAP)
            elif (tokens[1] == "STATUS"):
                resp = tn.read_until(ENDOFSTATUS)
            else:
                resp = tn.read_some()
            print("Response is: ", resp)
            await websocket.send(resp.decode())

    asyncio.get_event_loop().run_until_complete(
        ws.serve(echo, '127.0.0.1', 8765))
    asyncio.get_event_loop().run_forever()