'use strict';

/**
 * Pivotapps Admin Base error for all custom errors thrown by Pivotapps Admin backend.
 */
class BaseError extends Error {
    constructor (message) {
        super(message);
        this.name = 'PivotappsAdminBaseError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;

/**
 * Thrown when the kaseya access token does not exist.
 */
class KaseyaTokenError extends BaseError {
    constructor (message) {
        super(message);
        this.name = 'KaseyaTokenError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.KaseyaTokenError = KaseyaTokenError;

/**
 * Thrown when the kaseya access token has expired.
 */
class KaseyaExpiredTokenError extends KaseyaTokenError {
    constructor (message) {
        super(message);
        this.name = 'KaseyaExpiredTokenError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.KaseyaExpiredTokenError = KaseyaExpiredTokenError;

/**
 * Thrown when the kaseya host for the current user company does not exist in our SQL DB.
 */
class InvalidKaseyaHostError extends BaseError {
    constructor (message) {
        super(message);
        this.name = 'InvalidKaseyaHostError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InvalidKaseyaHostError = InvalidKaseyaHostError;

class AdminPermissionsError extends BaseError {
    constructor (message) {
        super(message);
        this.name = 'AdminPermissionsError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AdminPermissionsError = AdminPermissionsError;

class InvalidKaseyaSearchOptionsError extends BaseError {
    constructor (message) {
        super(message);
        this.name = 'InvalidKaseyaSearchOptionsError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InvalidKaseyaSearchOptionsError = InvalidKaseyaSearchOptionsError;

class InvalidProcedureIdError extends BaseError {
    constructor (message) {
        super(message);
        this.name = 'InvalidProcedureIdError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.InvalidProcedureIdError = InvalidProcedureIdError;

class ResourcePermissionsError extends BaseError {
    constructor (message, statusCode) {
        super(message);
        this.name = 'ResourcePermissionsError';
        this.code = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ResourcePermissionsError = ResourcePermissionsError;

class LuisApiError extends BaseError {
    constructor (message, statusCode) {
        super(message);
        this.name = 'LuisApiError';
        this.code = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.LuisApiError = LuisApiError;


class MissingPublicKeyError extends BaseError {
    constructor (message, statusCode) {
        super(message);
        this.name = 'MissingPublicKeyError';
        this.code = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.MissingPublicKeyError = MissingPublicKeyError;
