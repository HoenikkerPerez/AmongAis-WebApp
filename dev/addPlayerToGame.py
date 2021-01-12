#!/usr/bin/python

import sys, getopt
import telnetlib
import time

TCP_IP = 'margot.di.unipi.it'
TCP_PORT = 8421
TIMEOUT = 100000

def main(argv):
   playerName = "webTest"
   gameName = ''
   try:
      opts, args = getopt.getopt(argv,"hi:o:")
   except getopt.GetoptError:
      print('test.py -i <indexPlayer> -g <gameName>')
      sys.exit(2)
   for opt, arg in opts:
      if opt == '-h':
         print('test.py -i <indexPlayer> -g <gameName>')
         sys.exit()
      elif opt in ("-i"):
         playerName = playerName + str(arg)
      elif opt in ("-o"):
         gameName = arg
   print("player", playerName, "joining", gameName)


   with telnetlib.Telnet(TCP_IP, TCP_PORT, TIMEOUT) as tn:
      time.sleep(.6)
      cmd = gameName + " JOIN " + playerName + " H role test2\n"
      encoded = cmd.encode()
      tn.write(encoded)
      time.sleep(.6)
      # print(tn.read_until(ENDOFMAP))
      print(tn.read_some())



if __name__ == "__main__":
   main(sys.argv[1:])
