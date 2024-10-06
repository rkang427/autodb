POSTGRES_PASSWORD ?= "password"
POSTGRES_USER ?= "admin"
POSTGRES_DB ?= "main"
DRAWIO ?= "/Applications/draw.io.app/Contents/MacOS/draw.io"

eer: 
	$(DRAWIO) -x -f jpg -o Phase_1/team006_p1_eer.jpg Phase_1/team006_p1_eer.drawio
	$(DRAWIO) -x -f pdf -o Phase_1/team006_p1_eer.pdf Phase_1/team006_p1_eer.drawio

ifd: 
	$(DRAWIO) -x -f jpg -o Phase_1/team006_p1_ifd.jpg Phase_1/team006_p1_ifd.drawio
	$(DRAWIO) -x -f pdf -o Phase_1/team006_p1_ifd.pdf Phase_1/team006_p1_ifd.drawio

eer2rel:
	$(DRAWIO) -x -f jpg -o Phase_2/team006_p2_eer2rel.jpg Phase_2/team006_p2_eer2rel.drawio
	$(DRAWIO) -x -f pdf -o Phase_2/team006_p2_eer2rel.pdf Phase_2/team006_p2_eer2rel.drawio

diagrams: eer ifd eer2rel

db_up:
	docker-compose -f tools/docker-compose.yml up -d 

db_down:
	docker-compose -f tools/docker-compose.yml down

db_clean:
	docker-compose -f tools/docker-compose.yml down -v

db_schema:
	PGPASSWORD=$(POSTGRES_PASSWORD) psql -h 0.0.0.0 -p 5432 -U $(POSTGRES_USER) -d $(POSTGRES_DB) -f Phase_2/team006_p2_schema.sql
	PGPASSWORD=$(POSTGRES_PASSWORD) psql -h 0.0.0.0 -p 5432 -U $(POSTGRES_USER) -d $(POSTGRES_DB) -f tests/load_data.sql


test: db_schema
	pytest -vv tests/ --log-cli-level=INFO --log-cli-format="%(message)s"

check-lint:
	sqlfluff lint Phase_2/team006_p2_schema.sql --dialect postgres
	black --check .
	isort --check .
	flake8 .

fix-lint:
	sqlfluff fix Phase_2/team006_p2_schema.sql --dialect postgres
	black .
	isort .
	flake8 .

connect_dealership:
	PGPASSWORD="$(POSTGRES_PASSWORD)" psql -h 0.0.0.0 -p 5432 -U "$(POSTGRES_USER)" -d "dealership"
