import { Query } from "mongoose";
import { excludeField } from "../constants";

export class QueryBuilder<T> {
    public modelQuery: Query<T[], T>;
    public readonly query: Record<string, string>

    constructor(modelQuery: Query<T[], T>, query: Record<string, string>) {
        this.modelQuery = modelQuery;
        this.query = query;
    }


    filter(): this {
        const filter = { ...this.query } // creates a copy of the this.query object to avoid mutating it.

        for (const field of excludeField) {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete filter[field] //It iterates over a list of excludeFields (which likely contains 'searchTerm', 'sort', 'page', 'limit', 'fields') and removes them from the copied object, because filter will not work with other fields. The remaining key-value pairs in the filter object (e.g., { location: 'Dhaka' }) are treated as query conditions.
        }

        this.modelQuery = this.modelQuery.find(filter) // Tour.find().find(filter)

        return this;
    }

    search(searchableField: string[]): this {
        const searchTerm = this.query.searchTerm || ""
        const searchQuery = { //It constructs a MongoDB $or query. This query will match documents where the searchTerm is found in any of the fields listed in the searchableField array (e.g., ['title', 'description', 'location']).
            $or: searchableField.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } })) //$options: "i" flag for a case-insensitive search. $regex helps with finding the term in any words.
        }
        this.modelQuery = this.modelQuery.find(searchQuery)
        return this
    }

    sort(): this {

        const sort = this.query.sort || "-createdAt"; //If no sort parameter is provided, it defaults to sorting by creation date in descending order (-createdAt).

        this.modelQuery = this.modelQuery.sort(sort)

        return this;
    }
    fields(): this {
        //to limit which fields are returned in the documents (projection).
        const fields = this.query.fields?.split(",").join(" ") || "" //Mongoose's .select() method expects a space-separated string ('title price location'), so it replaces the commas with spaces. If no fields are specified, it defaults to an empty string, which tells Mongoose to return all fields.

        this.modelQuery = this.modelQuery.select(fields) //It applies the projection using .select().

        return this;
    }
    paginate(): this {

        const page = Number(this.query.page) || 1
        const limit = Number(this.query.limit) || 10
        const skip = (page - 1) * limit //It calculates how many documents to skip to get to the desired page.


        this.modelQuery = this.modelQuery.skip(skip).limit(limit)

        return this;
    }

    build() {
        return this.modelQuery // it just returns the final, fully constructed modelQuery object. Since a Mongoose Query object is "thenable," you can directly await the result of build() to execute the query against the database and get the documents.
    }

    async getMeta() { //To generate pagination metadata (total items, total pages, etc.).
        const totalDocuments = await this.modelQuery.model.countDocuments()

        const page = Number(this.query.page) || 1
        const limit = Number(this.query.limit) || 10

        const totalPage = Math.ceil(totalDocuments / limit)

        return { page, limit, total: totalDocuments, totalPage }
    }
}