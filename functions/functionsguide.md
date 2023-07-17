# Technical Overview and Troubleshooting

## Overview
The functions provided here are part of a larger system that calculates various metrics and rankings for a database of pumpkin growers and their pumpkins. These metrics include global, state, and country rankings (both lifetime and yearly), the lifetime best rank of a grower, and the popularity of contests.

The database system used is Firestore, Google's NoSQL cloud database. Data is stored in collections of documents, with each document having a unique id and containing fields of data.

## Functions
Each function follows a general pattern:
- Fetching data from the Firestore database
- Processing the fetched data
- Using a batch to update multiple documents in Firestore
- Committing the batch to apply the changes

The `calculateGlobalRankings`, `calculateStateRankings`, and `calculateCountryRankings` functions calculate the lifetime and yearly rankings for pumpkins globally, by state, and by country, respectively.

The `calculateLifetimeBestRank` function calculates the lifetime best rank for each grower.

The `calculateContestPopularityRanking` function calculates the popularity of each contest based on the number of pumpkins associated with it.

## Troubleshooting
**Error: No Matching Documents**
If a function logs the message "No matching [items].", it means the initial fetch from Firestore did not return any documents. Check that the collection name is correct and that the collection contains documents.

**Error: Invalid Document ID**
If a function logs the message "Invalid [item] id:", it means a document id is either not a string or an empty string. Check that the document id is being correctly retrieved and used.

**Error: NaN Rank**
If a rank value is NaN, it means a calculation used non-numeric values. Check that the values being used in calculations are numbers. One potential issue could be the use of a field that does not exist or has been renamed, resulting in undefined being used in calculations.

**Error: Document Update Failed**
If a document update fails, an error message should be logged. Check the error message for details. A common issue is trying to update a document that does not exist, which could be due to an incorrect document id.

## Performance
Each function fetches data from Firestore at the start. If the database is large, this could take a long time and consume a lot of memory. Consider fetching data in smaller batches.

Similarly, each function uses a Firestore batch to update multiple documents at once. There is a limit of 500 operations per batch. If there are more than 500 updates, the function commits the current batch and starts a new one. If a function seems to hang or fail without any error message, it might be due to too many updates in a single batch.

## Optimization
The functions were designed for a specific dataset and may not be optimal for all situations. Here are some potential optimizations:
- Fetching data in smaller batches to reduce memory usage.
- Fetching only the necessary fields from documents to reduce network usage.
- Using Firestore queries to filter data on the server-side, reducing the amount of data fetched and processed.
- Using Firestore transactions to ensure data consistency if multiple functions are running concurrently.

## Future Considerations
The functions were designed to be run manually and infrequently. If they need to be run more frequently or automatically, consider using Firestore triggers to run the functions when data changes. This would require significant changes to the functions to handle incremental updates rather than recalculating everything.

## Writing New Functions
Writing new functions to calculate similar statistics and rankings in Firestore requires an understanding of several concepts and principles:
- Firebase Firestore: Familiarize yourself with Firestore, its data model, and its query capabilities. Firestore stores data in documents, which are organized into collections. Each document is identified by a unique ID and can contain complex nested data. Understanding how to structure and query your data in Firestore is key to writing efficient functions.
- Asynchronous JavaScript and Promises: Many Firestore operations are asynchronous and return Promises. A strong understanding of asynchronous JavaScript, including async/await and Promises, is necessary. In particular, you'll need to understand how to use await with Firestore's get() method and other methods that return a Promise.
- Batched Writes: Firestore allows you to perform multiple write operations as a single batch that can be committed (or rolled back) together. This is useful when you want to write data derived from complex calculations or multiple read operations. Understanding how to create a batch, add operations to it, and commit it is crucial for updating multiple documents at once.
- Error Handling: Robust error handling is necessary to handle potential issues that can arise during the execution of your functions. This includes catching and handling Firestore errors (e.g., permission errors, unavailable service), data validation errors, and other runtime exceptions.
- Data Processing: You'll need to be comfortable with JavaScript's array and object methods for processing and transforming data. This includes filtering (Array.prototype.filter), mapping (Array.prototype.map), reducing (Array.prototype.reduce), and sorting (Array.prototype.sort) arrays, and working with object keys and values.
- Cloud Functions for Firebase: The functions we wrote are meant to be deployed as Cloud Functions for Firebase. Familiarize yourself with how to write, deploy, and test these functions.

When writing new functions, you should start by clearly defining what the function needs to do (its inputs and outputs) and then develop a strategy for how to achieve that. Consider the following:
- What data does the function need? How should it fetch this data from Firestore?
- What calculations or transformations does the function need to perform on this data?
- How should the function write the results back to Firestore?
- How can the function handle potential errors and edge cases?
- How can the function's performance be optimized, especially in terms of Firestore reads and writes?

Remember to test your functions thoroughly with a variety of data to ensure they behave as expected.


# AI Cheat Sheet

## Firestore
- Firestore: NoSQL, cloud.
- Data in collections of documents. Document: unique id, fields.
- fetch: collection().get().
- filter: where(field, operator, value).
- document reference: collection('collectionName').doc('docId').
- update: docRef.update(data).

## Functions
- Async functions, Promises (async/await).
- Fetch, process, batch update, commit.

## Rank Calculation
- Fetch data (exclude disqualified).
- Sort (desc weight).
- Assign rank, update Firestore.

## Batch
- Firestore batch: db.batch().
- Add to batch: batch.update(docRef, data).
- Commit: batch.commit().
- Limit: 500 operations/batch.

## Error Handling
- Check data validity before processing.
- Catch and log errors.

## Optimization
- Fetch in smaller batches.
- Fetch only necessary fields.
- Server-side filter with Firestore queries.
- Use Firestore transactions for data consistency.

## Write New Functions
- Define function (inputs, outputs).
- Fetch data from Firestore.
- Perform calculations/transformations.
- Write results back to Firestore.
- Handle errors and edge cases.
- Optimize performance (Firestore reads/writes).
