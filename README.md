# media-protect-issue
```
# Ensure we have the version specific Umbraco templates
dotnet new install Umbraco.Templates::13.1.1 --force

# Create solution/project
dotnet new sln --name "MySolution"
dotnet new umbraco --force -n "MyProject" --friendly-name "Administrator" --email "admin@example.com" --password "1234567890" --development-database-type SQLite
dotnet sln add "MyProject"

#Add Packages
dotnet add "MyProject" package MediaProtect --version 13.1.0

dotnet run --project "MyProject"
#Running
```
