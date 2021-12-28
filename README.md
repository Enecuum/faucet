
### Installation

Clone the repo:

``` bash
git clone https://github.com/Enecuum/faucet.git
cd card-payments-api
```

Install MySQL and NodeJS (if needed)

MySQL:
```
sudo apt install mysql-server -y
```

NodeJS:
```sh
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Create database

```
mysql -uroot -e "CREATE DATABASE faucet;"
```

Load DB schema from dump:
```
mysql -uroot card_payments < faucet.sql
```

### Run
Rename `config.example` to `config.json`
In `config.json`, set your MySQL config in the `mysql` object.

Install PM2:
```
sudo npm i -g pm2
```
Install project packages: 
```
npm i
```
Start server via PM2 script
```
pm2 start app.js
```