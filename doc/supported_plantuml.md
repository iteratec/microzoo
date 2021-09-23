#Supported PlantUml syntax

microzoo currently supports following PlanUml elements:

### services
````
component "service 1" <<service>>
````
The name of a service can be freely chosen and is used for referencing a service. Services must have the stereotype `<<service>>`

### databases
````
database "database 1" <<database>>
````
The name of a database can be freely chosen and is used for referencing a database. Databases must have the stereotype `<<service>>`

### Port mappings
````
interface "port: 8080"
````
The name must be of the form `port: n`, where n is a port number.

### Connections and dependencies
````
[myService] -> [myStore]: JDBC
[port: 8080] -> [myService]: HTTP/REST
````
Components can be connected by using the arrow notation. Instead of `->`, other line styles such as `.>` or `-->` may also be used.
A protocol specification such as `JDBC` or `HTTP/REST` is also required.

### Note blocks
Notes are used for setting certain component properties. Some properties are mandatory, others are optional.
````
note bottom of "database 1" {
    type: mysql
}
````
The type property is mandatory for services and database and determine which implementation is used for this component.
The type has to be one of the available component names in the folders *components/database* and *components/service*. 
The component names and available properties are specified in the corresponding manifest files *microzoo.yml* which resides in each component folder.

