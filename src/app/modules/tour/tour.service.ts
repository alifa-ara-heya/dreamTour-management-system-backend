
import { QueryBuilder } from "../../utils/QueryBuilder";
import { Division } from "../division/division.model";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourCreationPayload, ITourType } from "./tour.interface";
import { Tour, TourType } from "./tour.model";

const createTour = async (payload: ITourCreationPayload) => {
    // ... (check for existing tour title)
    const existingTour = await Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }

    // const baseSlug = payload.title.toLowerCase().split(" ").join("-")
    // let slug = `${baseSlug}`

    // let counter = 0;
    // while (await Tour.exists({ slug })) {
    //     slug = `${slug}-${counter++}` // dhaka-division-2
    // }

    // payload.slug = slug;

    // STEP 1: Find the Division by its name OR slug
    const division = await Division.findOne({
        $or: [{ slug: payload.division }, { name: payload.division }]
    });

    // STEP 2: Handle cases where the division isn't found
    if (!division) {
        throw new Error(`Division with name or slug '${payload.division}' not found.`);
    }

    // STEP 3: Find the Tour Type by its name
    const tourType = await TourType.findOne({ name: payload.tourType as string });
    if (!tourType) {
        throw new Error(`TourType with name '${payload.tourType}' not found.`);
    }

    // STEP 4: Prepare the final data for database insertion
    const tourData: Omit<ITour, 'slug'> = {
        ...payload, // Copy all original data from the request
        division: division._id, // OVERWRITE division with the found ObjectId
        tourType: tourType._id  // OVERWRITE tourType with the found ObjectId
    };

    // STEP 5: Create the tour with the correct IDs
    const tour = await Tour.create(tourData)

    return tour;
};

// const getAllToursOld = async (query: Record<string, string>) => {
//     console.log(query);
//     const filter = query
//     const searchTerm = query.searchTerm || "";
//     const sort = query.sort || "-createdAt";
//     const page = Number(query.page) || 1
//     const limit = Number(query.limit) || 10
//     const skip = (page - 1) * limit

//     //field fitlering
//     const fields = query.fields?.split(",").join(" ") || ""

//     //old field => title,location
//     //new fields => title location

//     // delete filter["searchTerm"]
//     // delete filter["sort"]



//     for (const field of excludeField) {
//         // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
//         delete filter[field]
//     }

//     console.log(filter);



//     const searchQuery = {
//         $or: tourSearchableFields.map(field => ({ [field]: { $regex: searchTerm, $options: "i" } }))
//     }

//     // [remove][remove][remove](SKip)[][][][][][]

//     // [][][][][](limit)[remove][remove][remove][remove]

//     // 1 page => [1][1][1][1][1][1][1][1][1][1] skip = 0 limit =10
//     // 2 page => [1][1][1][1][1][1][1][1][1][1]=>skip=>[2][2][2][2][2][2][2][2][2][2]<=limit skip = 10 limit =10
//     // 3 page => [1][1][1][1][1][1][1][1][1][1]=>skip=>[2][2][2][2][2][2][2][2][2][2]<=limit skip = 20 limit = 10

//     // skip = (page -1) * 10 = 30

//     // ?page=3&limit=10

//     // const tours = await Tour.find(searchQuery).find(filter).sort(sort).select(fields).skip(skip).limit(limit);

//     const filterQuery = Tour.find(filter)

//     const tours = filterQuery.find(searchQuery)

//     const allTours = await tours.sort(sort).select(fields).skip(skip).limit(limit)

//     // location = Dhaka
//     // search = Golf
//     const totalTours = await Tour.countDocuments();
//     // const totalPage = 21/10 = 2.1 => ciel(2.1) => 3
//     const totalPage = Math.ceil(totalTours / limit)

//     const meta = {
//         page: page,
//         limit: limit,
//         total: totalTours,
//         totalPage: totalPage,
//     }
//     return {
//         data: allTours,
//         meta: meta
//     }
// };

const getAllTours = async (query: Record<string, string>) => {
    //contains the core business logic. It returns the final data and metadata back to the controller. It knows nothing about HTTP requests or responses.

    const queryBuilder = new QueryBuilder(Tour.find(), query)

    const tours = await queryBuilder
        .search(tourSearchableFields)
        .filter()
        .sort()
        .fields()
        .paginate()

    // const meta = await queryBuilder.getMeta()

    const [data, meta] = await Promise.all([
        tours.build(),
        queryBuilder.getMeta()
    ])


    return {
        data,
        meta
    }
};


const updateTour = async (id: string, payload: Partial<ITourCreationPayload>) => {

    const existingTour = await Tour.findById(id);

    if (!existingTour) {
        throw new Error("Tour not found.");
    }

    // Separate the fields that need conversion (division, tourType) from the rest.
    const { division: divisionIdentifier, tourType: tourTypeIdentifier, ...restOfPayload } = payload;


    // Create a mutable object for the update payload
    const updateData: Partial<ITour> = { ...restOfPayload };

    // If division is being updated, find its ObjectId
    if (divisionIdentifier) {
        const division = await Division.findOne({
            $or: [
                { slug: divisionIdentifier },
                { name: divisionIdentifier }
            ]
        });
        if (!division) {
            throw new Error(`Division with name or slug '${divisionIdentifier}' not found.`);
        }
        updateData.division = division._id;
    }

    // If tourType is being updated, find its ObjectId
    if (tourTypeIdentifier) {
        const tourType = await TourType.findOne({ name: tourTypeIdentifier })

        if (!tourType) {
            throw new Error(`TourType with name ${tourTypeIdentifier} not found.`);
        }

        updateData.tourType = tourType._id
    }

    const updatedTour = await Tour.findByIdAndUpdate(id, updateData, { new: true });

    return updatedTour;
};

const deleteTour = async (id: string) => {
    const result = await Tour.findByIdAndDelete(id);
    if (!result) {
        throw new Error("Tour not found.");
    }
    return result;
};

const createTourType = async (payload: ITourType) => {
    const existingTourType = await TourType.findOne({ name: payload.name });

    if (existingTourType) {
        throw new Error("Tour type already exists.");
    }

    return await TourType.create(payload);
};
const getAllTourTypes = async () => {
    return await TourType.find();
};
const updateTourType = async (id: string, payload: ITourType) => {
    const existingTourType = await TourType.findById(id);
    if (!existingTourType) {
        throw new Error("Tour type not found.");
    }

    const updatedTourType = await TourType.findByIdAndUpdate(id, payload, { new: true });
    return updatedTourType;
};
const deleteTourType = async (id: string) => {
    const result = await TourType.findByIdAndDelete(id);
    if (!result) {
        throw new Error("Tour type not found.");
    }

    return result;
};

export const TourService = {
    createTour,
    createTourType,
    deleteTourType,
    updateTourType,
    getAllTourTypes,
    getAllTours,
    updateTour,
    deleteTour,
};