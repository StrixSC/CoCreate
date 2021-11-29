export const firebaseAuthErrorHandler: Record<string, string> = {
    "auth/app-deleted": "L'application n'existe plus. Veuillez contacter un administrateur",
    "auth/app-not-authorized": "Il y a eu une erreur d'autorization de serveur d'authentification. Veuillez contacter un administrateur.",
    "auth/argument-error": "Un ou plusieurs des champs donnés sont mauvais.",
    "auth/invalid-api-key": "Oups! Il y a un problème de communication avec notre serveur. Veuillez contacter un administrateur",
    "auth/invalid-user-token": "Oups! On dirait que vous avez été déconnecté du serveur, veuillez rafraichir la page! (Utilisez CTRL+Shift+r)",
    "auth/invalid-tennt-id": "Oups! On dirait qu'il y a une incohérence dans les données envoyées aux serveur. Veuillez contacter un administrateur",
    "auth/network-request-failed": "Oups! On dirait que nous avons perdu accès au réseau pour un bref moment. Veuillez réessayez a nouveau!",
    "auth/operation-not-allowed": "Oups! Cette méthode d'authentification n'est pas acceptée auprès du serveur.",
    "auth/requires-recent-login": "Oups! On dirait qu'i ly a eu une erreur lors de votre authentification. Veuillez contacter un administrateur.",
    "auth/too-many-requests": "Oups! On dirait qu'il y a eu trop de requêtes à la fois. Veuillez attendre avant de réessayer à nouveau.",
    "auth/user-disabled": "Oups! On dirait que vous essayez à un compte qui a été bloqué. Veuillez contacter un administrateur ou créer un autre compte.",
    "auth/user-token-expired": "Oups! On dirait que vous avez été déconnecté du serveur, veuillez rafraichir la page! (Utilisez CTRL+Shift+r)",
    "auth/web-storage-unsupported": "Oups! On dirait que votre navigateur n'est pas optimal pour cette application. SVP Utilisez Chrome",
    "auth/account-exists-with-different-credential": "On dirait que ce courriel est déjà utilisez sous une autre méthode de connexion (par exemple sous une connexion par Google). Si ce n'est pas le cas, veuillez contacter un administrateur.",
    "auth/user-not-found": "Il n'y a aucun compte avec ces informations dans nos registres. Veuillez validez vos informations et essayer à nouveau.",
    "auth/invalid-email": "Le courriel entré n'est pas un courriel valide.",
    "auht/wrong-password": "Le mot de passe entré ne correspond pas au mot de passe associé à ce courriel."
}