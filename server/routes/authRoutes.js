  import express from 'express';
  import User from '../models/user.js'
  import bcrypt from 'bcrypt'
  import jwt from "jsonwebtoken";
  import { authMiddleware } from "../routes/authMiddleware.js";
  

  const router = express.Router();


  router.post('/register', async (req,res)=>{
      try {
          const {usuario,email,password} = req.body;
          // Validaciones mínimas
          if (!usuario || !email || !password) {
          return res.status(400).json({ error: "Faltan datos" });
    }

          const exists = await User.findOne({ where: { email } });
          if (exists) return res.status(409).json({ error: "Email ya registrado" });

          const hashedPassword = await bcrypt.hash(password, 10);

          const newUser = await User.create({
          name: usuario,
          email,
          password: hashedPassword
      });
      const { password: _, ...userWithoutPassword } = newUser.toJSON();
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });



  router.post('/login', async (req,res)=>{
      try {
          const {email,password} = req.body;
          // Validaciones mínimas
          if (!email || !password) {
          return res.status(400).json({ error: "Faltan datos" });
    }

           const exists = await User.findOne({ where: { email } });
           if (!exists) return res.status(404).json({ error: "Usuario inexistente" });

          const coincide = await bcrypt.compare(password, exists.password);
          if(!coincide) {
            return res.status(401).json({ error: "Password no coincide" });
          }

          const token = jwt.sign({id: exists.id},process.env.JWT_KEY,{expiresIn:'3h'});

      res.status(200).json({ token});
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

    

  export default router;