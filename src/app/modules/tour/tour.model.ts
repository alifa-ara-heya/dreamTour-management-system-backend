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
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    images: { type: [String], default: [] },
    location: { type: String },
    costFrom: { type: Number },
    startDate: { type: Date },
    endDate: { type: Date },
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


tourSchema.pre("save", async function (next) //document middleware 
{

    if (this.isModified("title")) { //checks if the title field has been changed. This is an efficient way to ensure the slug is only regenerated when the title changes, not on every save.
        const baseSlug = this.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`

        let counter = 0;
        while (await Tour.exists({ slug })) //to check if a document with the generated slug already exists in the database. 
        {
            slug = `${slug}-${counter++}` // If a duplicate is found, it appends a counter to the slug (e.g., dhaka-division-0, my-awesome-tour-1) and checks again until a unique slug is found.
        }

        this.slug = slug; //assigns the final, unique slug to the document's slug property before it's saved.
    }
    next()
})

tourSchema.pre("findOneAndUpdate", async function (next) //query middleware
{
    const tour = this.getUpdate() as Partial<ITour> //retrieves the update object from the query.

    if (tour.title)  //checks if the title is being updated.
    {
        const baseSlug = tour.title.toLowerCase().split(" ").join("-")
        let slug = `${baseSlug}`


        let counter = 0;
        while (await Tour.exists({ slug })) {
            slug = `${slug}-${counter++}` // dhaka-division-2
        }

        tour.slug = slug
    }

    this.setUpdate(tour) //applies the modified update object back to the query, ensuring the new slug is included in the database operation.

    next()
})


export const Tour = model<ITour>("Tour", tourSchema)