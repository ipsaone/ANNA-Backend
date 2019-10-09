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



    ["handle-missions", ["root"]],
    ["handle-groups", ["root"]],
    ["handle-events", ["root", "organizers"]]

]