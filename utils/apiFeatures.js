class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  // TODO: 2) Build Filter Object
  filter() {
    let mongoFilter = { ...this.queryString };
    const removeFields = [
      "keyword",
      "searchType",
      "page",
      "lastId",
      "limit",
      "sort",
      "fields",
    ];
    removeFields.forEach((param) => delete mongoFilter[param]);
    console.log(mongoFilter); //{ price: { gt: '100' } }

    mongoFilter = JSON.stringify(mongoFilter);
    console.log(mongoFilter); //{"price":{"gt":"100"}}

    mongoFilter = mongoFilter.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`,
    );
    console.log(mongoFilter); //{"price":{"$gt":"100"}}

    mongoFilter = JSON.parse(mongoFilter);
    console.log(mongoFilter); //{price:{ '$gt' :"100"}}

    this.mongooseQuery = this.mongooseQuery.find(mongoFilter);

    return this;
  }

  // TODO: 2) Normal OR Text Search Index
  search() {
    const keyword = this.queryString.keyword;
    const searchType = this.queryString.searchType || "normal";

    if (!keyword) return this;

    if (searchType === "text") {
      this.mongooseQuery = this.mongooseQuery.find({
        $text: { $search: `"${keyword}"` },
      });
    } else {
      this.mongooseQuery = this.mongooseQuery.find({
        $or: [
          { name: { $regex: `^${keyword}`, $options: "i" } },
          { email: { $regex: `^${keyword}`, $options: "i" } },
        ],
      });
    }

    return this;
  }

  // TODO: 3) Normal or Cursor Pagination
  paginate(countDocuments) {
    const limit = this.queryString.limit || 20;
    const sort = this.queryString.sort === "asc" ? 1 : -1;

    // normal pagination
    if (this.queryString.page) {
      const page = Number(this.queryString.page) || 1;
      const skip = (page - 1) * limit;

      // pagination results
      const pagination = {};
      pagination.currentPage = page;
      pagination.limit = Number(limit);
      pagination.totalPages = Math.ceil(countDocuments / limit);
      pagination.skip = skip;

      // next page
      if (page < pagination.totalPages) {
        pagination.next = page + 1;
      }
      if (skip) {
        pagination.prev = page - 1;
      }

      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
      this.paginationResult = pagination;

      // cursor pagination
    } else if (this.queryString.lastId) {
      const operator = sort === 1 ? "$gt" : "$lt";

      this.mongooseQuery = this.mongooseQuery.find({
        _id: { [operator]: this.queryString.lastId },
      });
    }

    return this;
  }

  // TODO: 5) Sort
  sort() {
    if (
      this.queryString.sort &&
      this.queryString.sort.toLowerCase() !== "asc" &&
      this.queryString.sort.toLowerCase() !== "desc"
    ) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else if (this.queryString.sort) {
      const sortBy = this.queryString.sort.toLowerCase() === "asc" ? 1 : -1;
      this.mongooseQuery = this.mongooseQuery.sort({ _id: sortBy });
    }

    return this;
  }

  // TODO: 6) Fields Limiting
  fields() {
    if (this.queryString.fields) {
      const selectFields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(selectFields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select("-__v");
    }

    return this;
  }
}

module.exports = ApiFeatures;
