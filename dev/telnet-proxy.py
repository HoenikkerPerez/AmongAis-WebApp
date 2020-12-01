import pathlib
import ssl

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

            close = False
            while (receiving):
                resp_tmp = tn.read_some()
                resp += resp_tmp

                if resp.decode().startswith('ERROR'):
                    print("ERROR!!!")
                    receiving = False
                    if resp.decode().startswith('ERROR 401'):
                        print("ERROR 401")
                        close = True
                elif tokens[1] == "LOOK":
                    # print("Look Token")
                    if resp.endswith(ENDOFMAP):  #  or (resp == b'')
                        receiving = False
                elif tokens[1] == "STATUS":
                    # print(resp.decode())
                    if resp.endswith(ENDOFSTATUS): #  or (resp == b'')
                        print("EndOfStatus Token")
                        receiving = False
                else:
                    receiving = False

            print("Response is: ", resp)
            if resp != b'':
                await websocket.send(resp.decode())
            else:
                print("HERE")
            if close:
                return


ssl_context = ssl.SSLContext(ssl.PROTOCOL_SSLv23)
localhost_pem = pathlib.Path(__file__).with_name("cert.pem")
key_pem = pathlib.Path(__file__).with_name("key.pem")
ssl_context.load_cert_chain(localhost_pem, keyfile=key_pem)

# webss = ws.serve(echo, '0.0.0.0', 8765, ssl=ssl_context)
webs = ws.serve(echo, '0.0.0.0', 8765)

asyncio.get_event_loop().run_until_complete(webs)
asyncio.get_event_loop().run_forever()
