// ACCESS CONTROL LIST
module.exports = [
    // [item, [group1, group2, ....] ],
    
    ["handle-users", ["root"]],
    ["handle-storage", ["root"]],

    ["index-posts", ["root", "authors", "default"]],
    ["store-post", ["root", "authors"]],
    ["show-post", ["root", "authors", "default"]],
    ["update-post", ["root", "authors"]],
    ["delete-post", ["root", "authors"]],



    ["handle-missions", ["root"]],
    ["handle-groups", ["root"]],
    ["handle-events", ["organizers"]]

]