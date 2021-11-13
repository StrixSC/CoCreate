const SocketErrors =
{
  "E0000" : "INTERNAL ERROR",
  "E1001" : "Le ID du canal ne peut pas être vide",
  "E1002" : "Le ID du canal doit contenir des symboles ASCII valide",
  "E1004" : "...",
  "E1003" : "..."
};

mixin SocketEventError {
  void  handleSocketError(errorCode) {
    print(SocketErrors[errorCode]);
  }
}