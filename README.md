```
mkdir /apps
cd /apps
git clone https://github.com/harissonmatos/oncafe-frontend-isael
cd oncafe-frontend-isael
cp .env.example .env
docker compose up -d
```


Este é o README para o Projeto oncafe. Aqui você encontrará informações sobre como rodar o projeto e as configurações necessárias.

Pré-requisitos
Node.js 20.11.1 ou superior
Yarn
Configuração do Arquivo .env
Certifique-se de criar um arquivo .env na raiz do projeto com as seguintes variáveis:

VITE_BASE_URL: A URL do backend
VITE_PASSWORD: A senha necessária para acessar o painel
Exemplo:
VITE_BASE_URL=http://localhost:3000
VITE_PASSWORD=senha_secreta

`Configuração do dockerfile`
campo EXPOSE para dizer qual a porta ira ficar exposta lembre-se de colocar tambem no comando `serve -s dist -p 3000` que fica no cmd do dockerfile

**start-oncafe.sh**
nesse arquivo está contido o comando para buildar a imagem e rodar o container caso queira alterar as portas do container ou nome da imagem... é nesse arquivo 

Instalação
Para instalar as dependências do projeto, execute o seguinte comando:
yarn

Comandos Disponíveis: 
yarn dev: Inicia o servidor de desenvolvimento.
yarn build: Compila o projeto para produção.