var bodyParser   = require("body-parser"),
methodOverride   = require("method-override"),
expressSanitizer = require("express-sanitizer"),
    mongoose     = require("mongoose"),
    express      = require("express"),
    app          = express();
    
mongoose.connect("mongodb://localhost/blog_app", {useMongoClient: true});
app.set("view engine", "ejs");
app.use(express.static("public"));              //so we can serve custom style sheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());                    //it has to go after bodyParser
app.use(methodOverride("_method"));

//SCHEME SETUP
var blogSchema = new mongoose.Schema({
   title: String,
   image: String,
   body: String,
   created: {type: Date, default: Date.now}     //It will grab the time at which the user created the post and use it as a Date
});

var Blog = mongoose.model("Blog", blogSchema);

//TEST Space


//RESTful ROUTES
//INDEX ROUTE
app.get("/", function(req, res) {
   res.render("landing"); 
});

app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
       if(err){
           console.log("ERROR!");
       } else {
           res.render("index", {blogs: blogs});
       }
    });
});

//NEW ROUTE
app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs", function(req, res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body);
    //this won't allow user to place <script> tags in your page - hack the page
    Blog.create(req.body.blog, function(err, newBlog){
    // req.body.blog - everything is grouped under blog, like - [title],[image],[body]
        if(err){
            res.render("new");
        } else {
            //redirect to index page    
            res.redirect("/blogs");
        }
    });
});

//SHOW ROUTE
app.get("/blogs/:id", function(req, res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("show", {blog: foundBlog});
       }
   });
});

//EDIT ROUTE
app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
       if(err){
           res.redirect("/blogs");
       } else {
           res.render("edit", {blog: foundBlog});
       }
    });
});

//UPDATE ROUTE
app.put("/blogs/:id", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);
   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
//findByIdAndUpdate(id, newBlog, callback) - blog is defined in form where we grab data, blog[title], blog[image] etc. 
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        }
   });
});

//DESTROY ROUTE
app.delete("/blogs/:id", function(req, res){
   //destroy the blog
   Blog.findByIdAndRemove(req.params.id, function(err){
      if(err){
          res.redirect("/blogs");
      } else {
          res.redirect("/blogs");
      }
   });
   //redirect somewhere
});



//SETUP A SERVER
app.listen(process.env.PORT, process.env.IP, function(req, res){
    console.log("Server is running!")
});