import { model, Schema } from "mongoose";
import { IDivision } from "./division.interface";


const divisionSchema = new Schema<IDivision>({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    thumbnail: { type: String },
    description: { type: String }
}, {
    timestamps: true
})


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

divisionSchema.pre("save", async function (next) {
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
        const Model = this.constructor as any;

        // Check for uniqueness and append counter if needed
        while (await Model.exists({ slug: slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        this.slug = slug;
    }
    next();
})

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

divisionSchema.pre("findOneAndUpdate", async function (next) {
    const divisionUpdate = this.getUpdate() as Partial<IDivision>;

    if (divisionUpdate.name) {
        let nameForSlug = divisionUpdate.name;

        if (!/division/i.test(nameForSlug)) {
            nameForSlug = `${nameForSlug} division`;
        }

        const baseSlug = nameForSlug.toLowerCase().replace(/\s+/g, '-');
        let slug = baseSlug;
        let counter = 1;

        const query = this.getQuery();
        while (await this.model.exists({ slug: slug, _id: { $ne: query._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        (this.getUpdate() as Partial<IDivision>).slug = slug;
    }

    next();
});



export const Division = model<IDivision>("Division", divisionSchema)