// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

// this runs on vercel, should be no need for async/await
async function handler(req, _ev) {
    console.log('CONSOLE_LOG::EDGE_LOG')
    
    return new Response(
        JSON.stringify({
            message: 'Hello, world!',
        }),
        {
            status: 200,
            headers: {
                'content-type': 'application/json',
            },
        }
    )
}

export const config = {
    runtime: 'experimental-edge',
};
  
export default handler;
