module.exports = (token) => {
  const text = `<!DOCTYPE html>
    <html>
    <head>
    <title>Document</title>
      <style>
    * {
              margin: 0;
              box-sizing: border-box;
              font-family: sans-serif;
            }
         .btn {
            background: #3498db;
             background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
            background-image: -moz-linear-gradient(top, #3498db, #2980b9);
            background-image: -ms-linear-gradient(top, #3498db, #2980b9);
            background-image: -o-linear-gradient(top, #3498db, #2980b9);
            background-image: linear-gradient(to bottom, #3498db, #2980b9);
            -webkit-border-radius: 28;
            -moz-border-radius: 28;
            border-radius: 30px;
            font-family: Arial;
            color: #ffffff;
            font-size: 20px;
            padding: 10px 20px 10px 20px;
            text-decoration: none;
        }
        
        .btn:hover{
            background: #3cb0fd;
            background-image: -webkit-linear-gradient(top, #3cb0fd, #3498db);
            background-image: -moz-linear-gradient(top, #3cb0fd, #3498db);
            background-image: -ms-linear-gradient(top, #3cb0fd, #3498db);
            background-image: -o-linear-gradient(top, #3cb0fd, #3498db);
            background-image: linear-gradient(to bottom, #3cb0fd, #3498db);
            text-decoration: none;
        }
        
      </style>
    </head>
    <body>
      <section class="container text-center"   style="
            color:white;
            margin: 5% 3% 5% 3%;
            background-color: #30343f;
            border: 3px solid #00b2ca;
            border-radius: 20px 20px; 
            "> 
        
              <h1 style=" color:#00b2ca ; text-align:center; font-weight:bold; font-size:30px; padding-top:2%; padding-bottom:1%">Welcome to Curiosity</h1>
              <div  style="color:#ddd8c4;text-align:center; font-size:20px; padding:1%">
                <p> 
          Thanks for creating your account in Curiosity.We are
          really happy to see you here. Please click link given
          below to verify your Account See you soon.
              </p>
              </div>
              <div  style=" color:#00b2ca; font-weight:bold;text-align:center; padding: 5% 0%">
                click below to verify<br/>
                <br/>
                <a href="http://localhost:3000/verify-email?token=${token}"><button class="btn btn-primary">Verify Account </button></a>
              </div>
    
      </section>
    
    <!-- End your code here -->
    </body>
    </html>`;
  return text;
};
