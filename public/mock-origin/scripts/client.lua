-- Mock client.lua source for testing the shield file proxy.
local importantLogic = "this should be unreadable after dump"

CreateThread(function()
    while true do
        Wait(0)
        -- anti-cheat logic that should be hidden from dumpers
        local ped = PlayerPedId()
        if IsPedShooting(ped) then
            TriggerServerEvent('anticheat:detect', 'weapon_fire')
        end
    end
end)
