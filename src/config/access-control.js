// ACCESS CONTROL LIST
module.exports = [
    // [item, [group1, group2, ....] ],

    ["index-posts", ["default"]],
    ["store-post", ["root", "authors"]],
    ["show-post", ["default"]],
    ["update-post", ["root", "authors"]],
    ["delete-post", ["root", "authors"]],

    ["index-missions", ["default"]],
    ["show-mission", ["default"]],
    ["store-mission", ["root"]],
    ["update-mission", ["root"]],
    ["delete-mission", ["root"]],

    ["index-tasks", ["default"]],
    ["show-task", ["default"]],
    ["store-task", ["root"]],
    ["update-task", ["root"]],
    ["delete-task", ["root"]],
    
    ["add-member-mission", ["root"]],
    ["rem-member-mission", ["root"]],

    ["index-users", ["default"]],
    ["show-user", ["default"]],
    ["store-user", ["root"]],
    ["update-user", ["root"]],
    ["delete-user", ["root"]],
    ["index-user-groups", ["default"]],
    ["store-user-group", ["root"]],
    ["delete-user-group", ["root"]],

    ["index-groups", ["default"]],
    ["show-group", ["default"]],
    ["store-group", ["root"]],
    ["update-group", ["root"]],
    ["delete-group", ["root"]],

    ["index-events", ["default"]],
    ["show-event", ["default"]],
    ["store-event", ["root", "organizers"]],
    ["update-event", ["root", "organizers"]],
    ["delete-event", ["root", "organizers"]]
]