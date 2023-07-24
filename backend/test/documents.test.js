const { getDocuments, initQAModel, queryDocuments } = require("../src/documents");

test("GIVEN no documents WHEN getting documents THEN return empty list", async () => {
    // set folder to directory with no documents
    process.env.DOCUMENT_FOLDER = "./test";
    const splitDocs =  getDocuments();
    expect(splitDocs.length).toBe(0);
});

test("GIVEN documents WHEN getting documents THEN return documents", async () => {
    // set folder to directory with documents
    process.env.DOCUMENT_FOLDER = "../resources/documents"
    const documents = await getDocuments();
    // check document length is greater than 0
    expect(documents.length).toBeGreaterThan(0);
    expect(true).toBe(true);
});


test("GIVEN initialising QA model THEN set the chain to initialised LLM", async () => {
    process.env.DOCUMENT_FOLDER = "../resources/documents"
    initQAModel();
    // check the chain variable is set to an instance of RetrievalQAChain
    expect(chain).toBeInstanceOf(RetrievalQAChain);
});

test("GIVEN question WHEN querying documents THEN return answer", async () => {
    process.env.DOCUMENT_FOLDER = "../resources/documents"
    initQAModel();
    const question = "Who is the CEO?";
    const answer = await queryDocuments(question);
    // check the answer names Bill as CEO
    expect(answer).toContain("Bill");
});