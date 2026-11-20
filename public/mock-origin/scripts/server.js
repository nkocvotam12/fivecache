// Mock server.js source for testing
const importantData = {
    apiKey: "sk_live_1234567890abcdef",
    webhookUrl: "https://discord.com/api/webhooks/..."
}

on('playerJoining', () => {
    console.log('Player joined', importantData)
})
