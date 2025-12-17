export class NoRolesAssignedUserError extends Error {
    constructor() {
        super("There are no rules assigned to the user.");
    }
}