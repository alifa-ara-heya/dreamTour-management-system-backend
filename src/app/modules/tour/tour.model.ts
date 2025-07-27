import { model, Schema } from "mongoose";
import { ITour, ITourType } from "./tour.interface";

const tourTypeSchema = new Schema<ITourType>({
    name: { type: String, required: true, unique: true }
}, {
    timestamps: true
})

export const TourType = model<ITourType>("TourType", tourTypeSchema)

const tourSchema = new Schema<ITour>({
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    costFrom: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
    departureLocation: { type: String },
    arrivalLocation: { type: String },
    included: { type: [String], default: [] },
    excluded: { type: [String], default: [] },
    amenities: { type: [String], default: [] },
    tourPlan: { type: [String], default: [] },
    maxGuest: { type: Number },
    minAge: { type: Number },
    division: {
        type: Schema.Types.ObjectId,
        ref: "Division",
        required: true
    },
    tourType: {
        type: Schema.Types.ObjectId,
        ref: "TourType",
        required: true
    }
}, {
    timestamps: true
})


/* 
tourSchema.pre("save", async function (next) {

    if (this.isModified("title")) {
        const baseSlug = this.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`

        let counter = 0;
        while (await Tour.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        this.slug = slug;
    }
    next()
}) */

// gemini suggested

tourSchema.pre("save", async function (next) {
    if (this.isModified("title")) {
        // const baseSlug = this.title.toLowerCase().split(" ").join("-");
        // gemini
        const baseSlug = this.title.toLowerCase().replace(/\s+/g, '-');
        let slug = baseSlug;
        let counter = 1;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Model = this.constructor as any;
        while (await Model.exists({ slug: slug })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        this.slug = slug;
    }
    next();
});


/* tourSchema.pre("findOneAndUpdate", async function (next) {
    const tour = this.getUpdate() as Partial<ITour>

    if (tour.title) {
        const baseSlug = tour.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`


        let counter = 0;
        while (await Tour.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        tour.slug = slug
    }

    this.setUpdate(tour)

    next()
}) */

// gemini suggested the following


tourSchema.pre("findOneAndUpdate", async function (next) {
    const tourUpdate = this.getUpdate() as Partial<ITour>;

    if (tourUpdate.title) {
        const baseSlug = tourUpdate.title.toLowerCase().split(" ").join("-");
        let slug = baseSlug;
        let counter = 1;

        // In a query middleware, `this.model` refers to the model being updated.
        // We also need to ensure the slug check excludes the document being updated itself.
        const query = this.getQuery();
        while (await this.model.exists({ slug: slug, _id: { $ne: query._id } })) {
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
        (this.getUpdate() as Partial<ITour>).slug = slug;
    }

    next();
});


export const Tour = model<ITour>("Tour", tourSchema)