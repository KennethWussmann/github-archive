"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.logLevelSchema = exports.Logger = void 0;
var winston_1 = __importDefault(require("winston"));
var winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
var zod_1 = require("zod");
var createWinstonLogger = winston_1.default.createLogger, format = winston_1.default.format;
var winston_2 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_2.Logger; } });
exports.logLevelSchema = zod_1.z
    .union([
    zod_1.z.literal("debug"),
    zod_1.z.literal("info"),
    zod_1.z.literal("warn"),
    zod_1.z.literal("error"),
    zod_1.z.literal("fatal"),
])
    .default("info");
var getLogLevel = function () {
    var parsingResult = exports.logLevelSchema.safeParse(process.env.LOG_LEVEL);
    if (!parsingResult.success) {
        return "info";
    }
    return parsingResult.data;
};
var createLogger = function (_a) {
    var _b = _a === void 0 ? {} : _a, level = _b.level, _c = _b.logDestination, logDestination = _c === void 0 ? process.env.LOG_DESTINATION : _c, meta = _b.meta;
    return createWinstonLogger({
        level: level !== null && level !== void 0 ? level : getLogLevel(),
        format: format.combine(format.timestamp(), format.json()),
        defaultMeta: meta,
        transports: [
            new winston_1.default.transports.Console(),
            logDestination
                ? new winston_daily_rotate_file_1.default({
                    filename: "%DATE%.log",
                    dirname: logDestination,
                    utc: true,
                    zippedArchive: true,
                })
                : undefined,
        ].filter(function (t) { return !!t; }),
    });
};
exports.createLogger = createLogger;
