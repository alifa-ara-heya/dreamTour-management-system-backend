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
exports.Division = void 0;
const mongoose_1 = require("mongoose");
const divisionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String }
}, {
    timestamps: true
});
/* divisionSchema.pre("save", async function (next) {
    if (this.isModified("name")) {
        const baseSlug = this.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        this.slug = slug;
    }
    next()
}) */
// gemini suggested the following
// pre-save hook to generate slug form name
divisionSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // only generate slug if name is modified or it's a new document
        if (this.isModified("name") || this.isNew) {
            let nameForSlug = this.name;
            // Append ' division' if the name doesn't already contain it, for consistency
            if (!/division/i.test(nameForSlug)) {
                nameForSlug = `${nameForSlug} division`;
            }
            const baseSlug = nameForSlug.toLowerCase().replace(/\s+/g, '-');
            let slug = baseSlug;
            let counter = 1;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Model = this.constructor;
            // Check for uniqueness and append counter if needed
            while (yield Model.exists({ slug: slug })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            this.slug = slug;
        }
        next();
    });
});
/* divisionSchema.pre("findOneAndUpdate", async function (next) {
    const division = this.getUpdate() as Partial<IDivision>

    if (division.name) {
        const baseSlug = division.name.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}-division`

        let counter = 0;
        while (await Division.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        division.slug = slug
    }

    this.setUpdate(division)

    next()
}) */
// gemini suggested the following
divisionSchema.pre("findOneAndUpdate", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const divisionUpdate = this.getUpdate();
        if (divisionUpdate.name) {
            let nameForSlug = divisionUpdate.name;
            if (!/division/i.test(nameForSlug)) {
                nameForSlug = `${nameForSlug} division`;
            }
            const baseSlug = nameForSlug.toLowerCase().replace(/\s+/g, '-');
            let slug = baseSlug;
            let counter = 1;
            const query = this.getQuery();
            while (yield this.model.exists({ slug: slug, _id: { $ne: query._id } })) {
                slug = `${baseSlug}-${counter}`;
                counter++;
            }
            this.getUpdate().slug = slug;
        }
        next();
    });
});
exports.Division = (0, mongoose_1.model)("Division", divisionSchema);
