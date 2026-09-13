# RosterUp

RosterUp is our SIT725 group project for making shift swaps easier. Instead of
asking “Can anyone take my shift?” in the group chat and watching the message
get buried, employees can post an open shift and someone else can claim it.
Managers can approve the change, and everyone knows who is working without
scrolling through a hundred messages.

## Run RosterUp locally

You will need Node.js 20.19 or newer and Docker Desktop.

1. Clone the repository and open the project.

```bash
git clone https://github.com/sahancz/rosterup-sit725.git
cd rosterup-sit725
git switch sprint2-integration
```

2. Install the project packages and create your local environment file.

```bash
npm install
cp .env.example .env
```

3. Start MongoDB and add the demo data.

```bash
docker compose up -d
npm run seed
```

4. Start the application.

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Manager demo account

```text
john.smith@test.com
Password123!
```

Employee demo account

```text
sarah.jones@test.com
Password123!
```

Press `Control + C` to stop the application. Run `docker compose down` when
you also want to stop MongoDB.

## Project status

Sprint 1 is finished and RosterUp is now moving into Sprint 2. The main
features are working, including registration, workplace setup, employee
approvals, shift cover, manager approvals, chat and the manager workplace
views.

`main` contains the completed Sprint 1 version. `sprint2-integration` is where
the current Sprint 2 work comes together before it is reviewed and moved into
`main`.

Current work is tracked on the
[RosterUp Trello board](https://trello.com/b/D2KuzpJt/rosterup-sprint-1-planning).

Before starting development, have a quick look at
[CONTRIBUTING.md](CONTRIBUTING.md). Before opening or merging a pull request,
check [docs/MERGE_GUIDE.md](docs/MERGE_GUIDE.md). Future you and the rest of the
team will appreciate it.

## Core workflow

```text
Register or sign in
        |
        v
Create or join a workplace
        |
        v
Manager approves employee access
        |
        v
Employee posts a shift for cover
        |
        v
Coworker submits a claim
        |
        v
Manager approves or rejects the claim
        |
        v
Shift status and history are updated
```

## Users

### Manager

- Register and sign in as a manager.
- Create a workplace and receive an invite code.
- Approve or reject employee join requests.
- Review pending shift claims.
- Approve or reject shift-cover requests.
- View employees, shifts, and shift history.

### Employee

- Register and sign in as an employee.
- Join a workplace using its invite code.
- View upcoming and open shifts.
- Post a shift for cover.
- Claim an open shift.
- View claim outcomes and shift history.
- Withdraw an unclaimed posted shift.

## Approved scope

The Software Requirements Specification (SRS) is the source of truth for
project scope. Sprint work must map to an approved functional requirement or
use case.

The first version covers:

- Authentication and role-based access.
- Workplace creation and employee onboarding.
- Employee approval by a manager.
- Shift posting and open-shift browsing.
- Shift claims and manager approval.
- Shift status and history.
- Basic profile and workplace management.

The first version does not attempt to provide payroll, timesheets, leave
management, award interpretation, or unrelated chat functionality.

## Architecture

```text
Responsive web interface
          |
          v
Node.js and Express application
          |
          v
MongoDB database through Mongoose
```

The server is organised into routes, controllers, services, and Mongoose
models. Authentication, users, workplaces, shifts, and approvals should remain
separate modules so team members can work without unnecessary overlap.

## Technology

- Node.js 20.19 or newer
- Express
- MongoDB 7
- Mongoose
- HTML, CSS, and client-side JavaScript

## Development workflow

1. Claim a Trello card before beginning work.
2. Confirm that the card maps to the approved SRS.
3. Create a branch from `sprint2-integration`.
4. Make focused commits under your own GitHub account.
5. Test your change locally.
6. Open a pull request into `sprint2-integration`.
7. Address review comments and conflicts.
8. Merge only after approval.
9. Merge the integration branch into `main` only when the complete Sprint 2
   application has been reviewed and verified.

Direct pushes, force pushes, and deletion of `main` are blocked.

## Project documentation

- [Contribution guide](CONTRIBUTING.md)
- [Branch and merge guide](docs/MERGE_GUIDE.md)
- [Pull-request template](.github/pull_request_template.md)
- [GitHub contributors](https://github.com/sahancz/rosterup-sit725/graphs/contributors)

## Licence

This student project is currently distributed under the ISC licence declared
in `package.json`.

Documentation updated by Sahan on 14th Sep.
