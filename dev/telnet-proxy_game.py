import websockets as ws
import asyncio
import telnetlib

TCP_IP = 'margot.di.unipi.it'
TCP_PORT = 8421
TIMEOUT = 100000
ENDOFMAP = b'\n\xc2\xabENDOFMAP\xc2\xbb\n'
ENDOFSTATUS = b'\n\xc2\xabENDOFSTATUS\xc2\xbb\n'

async def echo(websocket, path):
    print("WEBSOCKET connected")
    with telnetlib.Telnet(TCP_IP, TCP_PORT, TIMEOUT) as tn:
        print("TELNET connected")

        async for message in websocket:
            resp = b''
            receiving = True
            messageType = "normal"
            print("WS resv:", message)
            tokens = message.split()
            encoded = message.encode()
            tn.write(encoded)
            print("Waiting for response...")

            while (receiving):
                resp_tmp = tn.read_some()
                if resp_tmp.decode().startswith('ERROR'):
                    receiving = False
                elif tokens[1] == "LOOK":
                    if resp_tmp.endswith(ENDOFMAP):
                        receiving = False
                elif tokens[1] == "STATUS":
                    if resp_tmp.endswith(ENDOFSTATUS):
                        receiving = False
                else:
                    receiving = False
                resp += resp_tmp

            print("Response is: ", resp)
            if resp != b'':
                await websocket.send(resp.decode())
            else:
                print("HERE")


asyncio.get_event_loop().run_until_complete(
    ws.serve(echo, '127.0.0.1', 8765))
asyncio.get_event_loop().run_forever()
