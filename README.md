# Create Turso Database

Automatically create and clone a [Turso database](https://turso.tech).

## Usage

### Branch

The most common use for the action is to create a new database from an existing database. This is useful for testing
changes to your database schema or data in a separate branch.

Add the following to your workflow:

```yaml
name: Create Database for Branch
on: create

jobs:
  create_database:
    name: "Create Database"
    runs-on: ubuntu-latest
    steps:
      - name: Create Database
        uses: vivid-web/turso-pr-review-apps@v0.0.3
        with:
          organization: ${{ secrets.TURSO_ORGANIZATION_NAME }}
          api_token: ${{ secrets.TURSO_API_TOKEN }}
          db_name: ${{ env.TURSO_DATABASE_NAME }}
```
