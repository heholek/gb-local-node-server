echo "Enter the name of this byte: "
read -r byteName

read -p "Continue (y/n)?" CONT
if [ "$CONT" = "y" ]; then
  echo "export BYTE_NAME=$byteName" >> ~/.bashrc
  echo "export BYTE_NAME=$byteName" >> ~/.zshrc
  echo "Everything setup!";
else
  echo "booo";
fi



