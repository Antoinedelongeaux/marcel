import requests

# URL de ton API
url = "https://91.108.112.18:3000/test"

# Envoyer la requête GET
response = requests.get(url, verify=False)  # `verify=False` pour ignorer les erreurs de certificat SSL non valide

# Vérifier si la réponse est correcte
if response.status_code == 200 and response.text == "Hello world!":
    print("Test réussi : La réponse est 'Hello world!'")
else:
    print("Test échoué : La réponse n'est pas 'Hello world!'")
    print("Status Code:", response.status_code)
    print("Réponse:", response.text)
