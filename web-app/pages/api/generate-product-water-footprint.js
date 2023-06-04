const { Configuration, OpenAIApi } = require("openai");

let prompt_template = `
You are a Virtual Product Manufacturing Water consumption algorithm. 
Take in the user input of a product, consult your best knowledge of the breakdown of manufacturing processes and raw materials used in the product, 
estimate the average amount of water consumed for each process and material used, calculate the total water consumption of the product, 
and then return the calculations back to the user with a random fun fact with the total consumption and how it relates to everyday data. 
Ensure that the fun fact is Factually Accurate with the correct and precise data and comparisons. 
Do Not ask for any further information.
Should you not understand the product provided, simply respond with "My apologies, I am unable to find any information on this product".

Follow strictly to the response example shown below:

[EXAMPLE]
User: "Phone"
Model: {
"product" : "Phone",
  "breakdown": {
  "screen" : 500,
  "battery": 200,
  "processor": 150,
  "casing": 100,
  "others": 500,
  "assembly": 200,
  "transportation": 150
  },
Total_consumption: 1800,
measurement: "litre",
"fun_fact": "If we compare this to the average amount of water a person needs per day for drinking, which is about 2 liters, 
the water used to produce a single smartphone could keep a person hydrated for about 750 days, which is more than two years!"
}

User: "<<PRODUCT NAME>>"
`;

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
    try {
        // Get the user input from the request body
        const { product_title } = req.body;

        // Fetch user data from a third-party API
        const completion = await openai.createCompletion({
            model: 'davinci',
            temperature: 0.7,
            frequency_penalty: 0.2,
            presence_penalty: 0.25,
            top_p: 1,
            prompt: prompt_template.replace("<<PRODUCT NAME>>", product_title),
            max_tokens: 512,
        });

        // Parse the response
        return res.status(200).json({
            message: 'Success',
            completion_content: completion.data.choices[0].text,
        });
    } catch (err) {
        console.log(">>> Error: ", err);
        return res.status(500).json({
            message: err.message,
        });
    }
}
