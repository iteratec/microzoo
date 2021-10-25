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
[service 1] -> [database 1]: JDBC
[port: 8080] -> [service 1]: HTTP/REST
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

### Supported properties

#### spring-boot
| Property | Datatype | Example | Description |
| -------- | -------- | ------- | ----------- |
| request-delay | string | 10ms, 2s | A delay, before a request is passed to a subsequent service or the database in milliseconds (ms) or seconds (s) |
| response-delay | string | 10ms, 2s | A delay, after a request is passed to a subsequent service or the database in milliseconds (ms) or seconds (s) |
| entity-count | number | 1000 | Number of entities, either stored in a connected database or generated |
| payload-size | number | 200 | Payload size in bytes. The payload contents are a generated random string |
