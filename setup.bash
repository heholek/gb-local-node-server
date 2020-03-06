echo "Enter the name of this byte: "
read -r byteName

echo "Enter the ip of the server: "
read -r serverIp

echo "Enter the ip of the socket: "
read -r socketIp

read -p "Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  echo "export BYTE_NAME=$byteName" >> ~/.bashrc
  echo "export BYTE_NAME=$byteName" >> ~/.zshrc
  echo "export SERVER_ADDRESS=$serverIp"
  echo "export SOCKET_ADDRESS=$socketIp"
  echo "Everything setup!";
else
  echo "booo";
fi



