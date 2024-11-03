# cs6400-2024-03-Team006

# Diagrams

We are using draw.io for developing our EER and IFD.

You can edit the file locally by downloading the appropriate drawio installer from https://github.com/jgraph/drawio-desktop/releases/tag/v24.7.8

You may need to install "make" to run this.

Our EER and IFD are located in `Phase_1/`.
Open and edit it with drawio.
Once you've made your changes, run `make diagrams` to generage JPG and PDF versions of them.
Then commit them to a branch and make a PR to the main branch.

The JPG is best for being able to view the changes in github. The PDF is what we will eventually turn in.

# Local Development Environment

## Requirements

### Ubuntu

```
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt install docker docker-compose postgresql-client-14 python3.12 pip3.12 python3.12-venv
# follow instructions on https://docs.docker.com/engine/install/linux-postinstall/
```

### MacOS

```
brew install --cask drawio
alias drawio="/Applications/draw.io.app/Contents/MacOS/draw.io"

brew install --cask docker
brew install postgresql@14
brew install python@3.12

# to prevent local postgres from competing with docker postgres
brew services stop postgresql@14
```

Seems like you need to open up the Docker App at least once from your launcher to get everything working.

Test that docker is running with

```
docker run hello-world
```

## Run Database with Docker Compose

To start a postgresql database running in a docker container bound to port 5432, run

```
make db_up
```

To apply the schema from `Phase_2/team006_p2_schema.sql`, run

```
make db_schema
```

To stop the database without removing data (that is stored in docker volume), run

```
make db_down
```

To stop container and remove all data, run

```
make db_clean
```

## Setup Test environment

Tests have been created using pytest and psycopg to manage connection to
postgres database. To run tests, create a python virtual environment with
python3.12

```
# remove any current .venv directory
rm -rf .venv

# create new venv
python3.12 -m venv .venv

# activate virtual environment
source .venv/bin/activate

# install dependencies
pip install -r requirements.txt
```

## Run the Tests

If you set up the database with the default username, password, port etc
everything should "just work".

Otherwise make sure you have set in your environment the same vars that are
indicated in the Makefile and that you started your database with.

```
make test
```

For more information about pytest see: https://docs.pytest.org/en/stable/

## Run linters on python and sql

To just check for errors, but not fix them:

```
make check-lint
```

To autoformat as much as possible to fix lint:

```
make fix-lint
```

Note: there may be some problems that need manual intervention, especially if syntax is wrong.

## Run backend

### System Dependencies

Install node `v22.9.0`
For Mac,

```
brew install node@22.9.0
brew link --force --overwrite node@22.9.0
```

### Node dependencies

```
cd Phase_3/backend
npm install
```

### Run dev server

Once you have database running with `make db_up`

```
cd Phase_3/backend
npm run dev
```

### Run tests

Once you have database running with `make db_up`
You can also run tests (no need to stop dev server)

```
cd Phase_3/backend
npm test
```

Alternatively, from root of repository, run

```
make test_backend
```

Either way, it will print information at end about code coverage and what tests passed/failed

## Examples of how to interact with endpoints

### Login
This is first thing you need to do to do following requests

```
curl -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" \
     -d '{"username": "ownerdoe", "password": "password"}' \
     -c cookies.txt
```


### POST requests -- for creating records

Vendor

```
curl -X POST http://localhost:3000/vendor \
-H "Content-Type: application/json" \
-d '{
  "name": "Vendor Name",
  "phone_number": "1234567890",
  "street": "123 Vendor St",
  "city": "Vendor City",
  "state": "Vendor State",
  "postal_code": "12345"
}' -b cookies.txt
```

Customer

```
curl -X POST http://localhost:3000/customer \
-H "Content-Type: application/json" \
-d '{
  "tax_id": "123456789",
  "phone_number": "5551234567",
  "first_name": "John",
  "last_name": "Doe",
  "street": "123 Elm St",
  "city": "Springfield",
  "state": "IL",
  "postal_code": "62701",
  "business_name": "Doe Enterprises",
  "title": "CEO",
  "customer_type": "b",
  "email": "john.doe@example.com"
}' -b cookies.txt
```

Vehicle
```
curl -X POST "http://localhost:3000/vehicle" \
-H "Content-Type: application/json" \
-d '{
  "vin": "1HGCM82633A123456",
  "vehicle_type": "Sedan",
  "manufacturer": "Honda",
  "model": "Accord",
  "model_year": 2023,
  "fuel_type": "Gas",
  "horsepower": 192,
  "condition": "Good",
  "purchase_price": "25000.00",
  "customer_seller": "123456789",
  "inventory_clerk": "ownerdoe",
  "sale_date": null,
  "colors": ["Blue", "Black"]
}' -b cookies.txt
```

Post Parts Order

```
curl -X POST http://localhost:3000/partsorder \
-H "Content-Type: application/json" \
-d '{
  "vin": "1HGCM82633A123456",
  "vendor_name": "Vendor Name",
  "parts":[
    {
       "part_number": "part1",
       "description": "cool part",
       "quantity": 1,
       "unit_price": 10.10
    },
    {
      "part_number" : "part2",
      "description": "another cool part",
      "quantity": 10,
      "unit_price": 5.00
    }
  ]
}'  -b cookies.txt
```

### GET requests -- for fetching records

To experiment with GET requests that are for reading data (with potential filters), do

Vendor

```
curl -X GET "http://localhost:3000/vendor?name=Vendor%20Name" -b cookies.txt
```

Customer

```
curl -X GET "http://localhost:3000/customer?tax_id=123456789" -b cookies.txt
```

Part Statistics Report

```
curl -X GET "http://localhost:3000/reports/part_statistics" -b cookies.txt
```

Price Per Condition Report

```
curl -X GET "http://localhost:3000/reports/price_condition" -b cookies.txt
```

Get Vehicle Detail
```
curl "http://localhost:3000/vehicle?vin=1HGCM82633A123456" -H "Accept: application/json" -b cookies.txt
```

Search Vehicle
```
curl "http://localhost:3000/vehicle/search?vin=1HGCM82633A123456&color=Blue&manufacturer=Ford&vehicle_type/search=SUV&fuel_type=Gas&model_year=2022&keyword=ford" -H "Accept: application/json" -b cookies.txt
```

Search Screen (aka Landing Page)
```
curl "http://localhost:3000/" -H "Accept: application/json" -b cookies.txt
```

### PATCH requests -- for updating records

Update parts status
// TODO: accept a list of parts??? either way works
```
curl -X PATCH http://localhost:3000/partsorder/updateStatus \
-H "Content-Type: application/json" \
-d '{
  "part_number": "part1",
  "parts_order_number": "1HGCM82633A123456-001",
  "status": "received"
}' 
```


Sell vehicle (note this is the one we created in earlier example)
```
curl -s -X PATCH http://localhost:3000/vehicle -d '{"vin": "1HGCM82633A123456", "customer_buyer": "444555666"}' -H 'Content-Type: application/json' -b cookies.txt
```
