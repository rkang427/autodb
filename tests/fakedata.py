import random
from decimal import Decimal

import mimesis
from mimesis.enums import DurationUnit

TWOPLACES = Decimal(10) ** -2


class FakeVehicle:

    def __init__(self):
        self.vin = self._vin()
        self.description = self._description()
        self.horsepower = self._horsepower()
        self.purchase_date = self._purchase_date()
        self.purchase_price = self._purchase_price()
        self.sale_date = self._sale_date()
        self.model_year = self._model_year()
        self.model = self._model()
        self.manufacturer = self._manufacturer()
        self.condition = self._condition()
        self.fuel_type = self._fuel_type()
        self.vehicle_type = self._vehicle_type()
        self.total_parts_price = self._total_parts_price()
        self.sale_price = self._sale_price()

    def _vin(self):
        chars = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ"
        return "".join(random.choice(chars) for _ in range(17))

    def _description(self):
        return " ".join(mimesis.Text().words()).replace("'", "")

    def _horsepower(self):
        return mimesis.Numeric().integer_number(100, 9000)

    def _purchase_date(self):
        start = 2010
        end = 2024
        return mimesis.Datetime().date(start=start, end=end)

    def _model_year(self):
        start = 1980
        end = self.purchase_date.year
        return mimesis.Datetime().year(minimum=start, maximum=end)

    def _model(self):
        return mimesis.Text().word().capitalize()

    def _manufacturer(self):
        return random.choice(
            [
                "Acura",
                "FIAT",
                "Lamborghini",
                "Nio",
                "Alfa Romeo",
                "Ford",
                "Land Rover",
                "Porsche",
                "Aston Martin",
                "Geeley",
                "Lexus",
                "Ram",
                "Audi",
                "Genesis",
                "Lincoln",
                "Rivian",
                "Bentley",
                "GMC",
                "Lotus",
                "Rolls-Royce",
                "BMW",
                "Honda",
                "Maserati",
                "smart",
                "Buick",
                "Hyundai",
                "MAZDA",
                "Subaru",
                "Cadillac",
                "INFINITI",
                "McLaren",
                "Tesla",
                "Chevrolet",
                "Jaguar",
                "Mercedes-Benz",
                "Toyota",
                "Chrysler",
                "Jeep",
                "MINI",
                "Volkswagen",
                "Dodge",
                "Karma",
                "Mitsubishi",
                "Volvo",
                "Ferrari",
                "Kia",
                "Nissan",
                "XPeng",
            ]
        )

    def _condition(self):
        return random.choice(["Excellent", "Very Good", "Good", "Fair"])

    def _fuel_type(self):
        return random.choice(
            [
                "Gas",
                "Diesel",
                "Natural Gas",
                "Hybrid",
                "Plugin Hybrid",
                "Battery",
                "Fuel Cell",
            ]
        )

    def _vehicle_type(self):
        return random.choice(
            [
                "Sedan",
                "Coupe",
                "Convertible",
                "CUV",
                "Truck",
                "Van",
                "Minivan",
                "SUV",
                "Other",
            ]
        )

    def _sale_date(self):
        return self.purchase_date + mimesis.Datetime().duration(
            min_duration=0, max_duration=600, duration_unit=DurationUnit.DAYS
        )

    def _total_parts_price(self):
        price = random.random() * random.randint(1000, 1000000)
        return Decimal(price).quantize(TWOPLACES)

    def _purchase_price(self):
        price = random.random() * random.randint(1000, 1000000)
        return Decimal(price).quantize(TWOPLACES)

    def _sale_price(self):
        price = (self.purchase_price * Decimal(1.25)) + (
            self.total_parts_price * Decimal(1.10)
        )
        return Decimal(price).quantize(TWOPLACES)
