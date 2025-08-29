"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
const constants_1 = require("../constants");
class QueryBuilder {
    constructor(modelQuery, query) {
        this.modelQuery = modelQuery;
        this.query = query;
    }
    filter() {
        const filter = Object.assign({}, this.query); // creates a copy of the this.query object to avoid mutating it.
        for (const field of constants_1.excludeField) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field]; //It iterates over a list of excludeFields (which likely contains 'searchTerm', 'sort', 'page', 'limit', 'fields') and removes them from the copied object, because filter will not work with other fields. The remaining key-value pairs in the filter object (e.g., { location: 'Dhaka' }) are treated as query conditions.
        }
        this.modelQuery = this.modelQuery.find(filter); // Tour.find().find(filter)
        return this;
    }
    search(searchableField) {
        const searchTerm = this.query.searchTerm || "";
        const searchQuery = {
            $or: searchableField.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } })) //$options: "i" flag for a case-insensitive search. $regex helps with finding the term in any words.
        };
        this.modelQuery = this.modelQuery.find(searchQuery);
        return this;
    }
    sort() {
        const sort = this.query.sort || "-createdAt"; //If no sort parameter is provided, it defaults to sorting by creation date in descending order (-createdAt).
        this.modelQuery = this.modelQuery.sort(sort);
        return this;
    }
    fields() {
        var _a;
        //to limit which fields are returned in the documents (projection).
        const fields = ((_a = this.query.fields) === null || _a === void 0 ? void 0 : _a.split(",").join(" ")) || ""; //Mongoose's .select() method expects a space-separated string ('title price location'), so it replaces the commas with spaces. If no fields are specified, it defaults to an empty string, which tells Mongoose to return all fields.
        this.modelQuery = this.modelQuery.select(fields); //It applies the projection using .select().
        return this;
    }
    paginate() {
        const page = Number(this.query.page) || 1;
        const limit = Number(this.query.limit) || 10;
        const skip = (page - 1) * limit; //It calculates how many documents to skip to get to the desired page.
        this.modelQuery = this.modelQuery.skip(skip).limit(limit);
        return this;
    }
    build() {
        return this.modelQuery; // it just returns the final, fully constructed modelQuery object. Since a Mongoose Query object is "thenable," you can directly await the result of build() to execute the query against the database and get the documents.
    }
    getMeta() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalDocuments = yield this.modelQuery.model.countDocuments();
            const page = Number(this.query.page) || 1;
            const limit = Number(this.query.limit) || 10;
            const totalPage = Math.ceil(totalDocuments / limit);
            return { page, limit, total: totalDocuments, totalPage };
        });
    }
}
exports.QueryBuilder = QueryBuilder;
