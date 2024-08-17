import { type Request, type Response } from "express";
import multer from "multer";
import fs from "fs";
import path, { parse } from "path";
import jwt, { JwtPayload } from "jsonwebtoken";
import { PrismaClient, Prisma } from "@prisma/client";
import { log } from "console";

const prisma = new PrismaClient();

export const testRoute = (req: Request, res: Response) => {
  try {
    res.send({ msg: "hello Product" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 6;
    const skip = (page - 1) * limit;

    let totalProducts: number = 0;
    let products;

    const minPrice = parseFloat(req.query.min as string);
    const maxPrice = parseFloat(req.query.max as string);
    const category = req.query.category as string;

    const startDate = req.query.startDate
      ? new Date(req.query.startDate as string)
      : null;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : null;

    const where: Prisma.productWhereInput = {};

    if (!isNaN(minPrice) && !isNaN(maxPrice)) {
      where.price = {
        gte: minPrice,
        lte: maxPrice,
      };
    }

    if (category) {
      where.categories = {
        contains: category,
      };
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    totalProducts = await prisma.product.count({
      where,
    });

    products = await prisma.product.findMany({
      take: limit,
      skip: skip,
      where,
    });

    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      products: products,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSingleProduct = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: parseInt(req.params.id),
      },
    });
    res.status(200).json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, "public/images");
      },
      filename: (_req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    const upload = multer({ storage }).single("image");

    upload(req, res, async (err: any) => {
      try {
        if (err instanceof multer.MulterError) {
          return res
            .status(400)
            .json({ error: "File upload error: " + err.message });
        } else if (err) {
          return res.status(400).json({ error: "File upload error" });
        }

        let imgUrl: string | null = null;

        if (req.file) {
          imgUrl = req.file.filename;
        }

        const { title, description, categories, quantity, price } = req.body;

        if (!title || !description || !categories || !quantity || !price) {
          return res
            .status(400)
            .json({ error: "Please provide all the required fields" });
        }

        const createProduct = await prisma.product.create({
          data: {
            title,
            description,
            categories,
            price: parseFloat(price), // Convert price to float if needed
            quantity: parseFloat(quantity), // Convert quantity to float if needed
            image: imgUrl || "",
          },
        });

        res.status(200).json(createProduct);
      } catch (error) {
        console.error("Internal Server Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const productImage = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      select: {
        image: true,
      },
    });

    let oldImgUrl = productImage?.image || "";
    console.log("Old Image", oldImgUrl);

    const storage = multer.diskStorage({
      destination: function (_req, _file, cb) {
        cb(null, "public/images");
      },
      filename: function (_req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
      },
    });

    const upload = multer({ storage }).single("image");

    upload(req, res, async function (err: any) {
      if (err instanceof multer.MulterError) {
        return res
          .status(400)
          .json({ error: "File upload error: " + err.message });
      } else if (err) {
        return res.status(400).json({ error: "File upload error" });
      }

      let newImgUrl = req.file?.filename || oldImgUrl;
      if (req.file) {
        const imagePath = path.join(
          __dirname,
          "../../public/images",
          oldImgUrl
        );
        console.log(imagePath);

        if (fs.existsSync(imagePath)) {
          fs.unlink(imagePath, (err) => {
            if (err) {
              console.error("Error deleting file:", err);
              return res
                .status(500)
                .json({ error: "Error deleting image file" });
            }
            console.log("File deleted successfully");
          });
        } else {
          console.error("File not found:", imagePath);
        }
      }

      console.log("New Image: ", newImgUrl);

      const { title, description, categories, quantity, price } = req.body;

      const updatedProduct = await prisma.product.update({
        where: {
          id: parseInt(req.params.id),
        },
        data: {
          title,
          price: parseFloat(price),
          description,
          categories,
          quantity: parseFloat(quantity),
          image: newImgUrl,
        },
      });

      res.status(200).json(updatedProduct);
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const productImage = await prisma.product.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
      select: {
        image: true,
      },
    });
    const imgUrl = productImage?.image || "";
    console.log(imgUrl);
    const imagePath = path.join(__dirname, "../../public/images", imgUrl);
    console.log(imagePath);

    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return res.status(500).json({ error: "Error deleting image file" });
        }
        console.log("File deleted successfully");
      });
    } else {
      console.error("File not found:", imagePath);
    }

    const deleteProduct = await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.status(200).json("Deleted Sucessfully!");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const buyProduct = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { userId, quantity } = req.body;
    const parsedQuantity = parseInt(quantity);

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (product.quantity < parsedQuantity) {
      return res.status(400).json({ error: "Product is out of stock" });
    }

    const transaction = await prisma.userProduct.create({
      data: {
        userId,
        productId,
        quantity: parsedQuantity,
        status: "checkout",
      },
    });

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        quantity: {
          decrement: parsedQuantity,
        },
      },
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const revertBuyCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;
    const deletedCheckoutProducts = await prisma.userProduct.deleteMany({
      where: {
        userId,
        status: "checkout",
      },
    });

    res.status(200).json({
      message: "Checkout reverted successfully",
      deletedCheckoutProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAdminDashboard = async (req: Request, res: Response) => {
  try {
    const productsBoughtByUsers = await prisma.userProduct.findMany({
      where: {
        status: "processing",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            quantity: true,
          },
        },
      },
    });

    res.status(200).json(productsBoughtByUsers);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCheckoutProduct = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    //console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken: any = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;
    const productId = parseInt(req.params.id);
    //console.log("Checkout Product Id:", productId);

    const userPurchase = await prisma.userProduct.findFirst({
      where: { userId, productId },
      include: { product: true },
    });

    if (!userPurchase) {
      return res.status(404).json({ error: "Product not found in checkout" });
    }

    const product = {
      name: userPurchase.product.title,
      price: userPurchase.product.price,
      quantity: userPurchase.quantity,
    };

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error fetching checkout product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { status } = req.body;
    const product = await prisma.userProduct.findFirst({
      where: {
        productId: productId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (product) {
      const userProductId = product.id;
      //console.log("User Product Id:", userProductId);

      const updatedProduct = await prisma.userProduct.update({
        where: {
          id: userProductId,
        },
        data: {
          status,
        },
      });
    }

    res.status(200).json({ product });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const userOrderDashboard = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    //console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken: any = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;
    //console.log("UserId", userId);
    const products = await prisma.userProduct.findMany({
      where: {
        userId,
        status: "delivered",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const productId = parseInt(req.params.id);
    const { userId, quantity } = req.body;

    const parsedQuantity = parseInt(quantity);

    const existingCartItem = await prisma.userProduct.findFirst({
      where: {
        userId: userId,
        productId: productId,
        status: "cart",
      },
    });

    if (existingCartItem) {
      const updatedCartItem = await prisma.userProduct.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + parsedQuantity },
      });

      res.status(200).json({
        message: "Product quantity updated in cart",
        cartItem: updatedCartItem,
      });
    } else {
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (product.quantity < parsedQuantity) {
        return res.status(400).json({ error: "Product is out of stock" });
      }

      const cartItem = await prisma.userProduct.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: parsedQuantity,
          status: "cart",
        },
      });

      res
        .status(200)
        .json({ message: "Product added to cart successfully", cartItem });
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const proceedToCheckout = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;

    const { productIDs } = req.body;

    await Promise.all(
      productIDs.map(async (productId: number) => {
        try {
          await prisma.userProduct.update({
            where: {
              id: productId,
              userId: userId,
            },
            data: {
              status: "checkout",
            },
          });
          console.log(`Product ID ${productId} updated to checkout`);
        } catch (error) {
          console.error(`Error updating product ID ${productId}:`, error);
        }
      })
    );

    res.status(200).json({ message: "Checkout successful" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCartProducts = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    //console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken: any = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;

    const products = await prisma.userProduct.findMany({
      where: {
        userId,
        status: "cart",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching checkout product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getCartProductsInCheckout = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.cookies.token;
    //console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken: any = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;

    const products = await prisma.userProduct.findMany({
      where: {
        userId,
        status: "checkout",
      },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching checkout product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const revertCartCheckout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId;

    const updatedCheckoutProducts = await prisma.userProduct.updateMany({
      where: {
        userId,
        status: "checkout",
      },
      data: {
        status: "cart",
      },
    });
    res.status(200).json({
      message: "Checkout reverted successfully",
      updatedCheckoutProducts,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const updateCartCheckoutProductStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const token = req.cookies.token;
    console.log(token);

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decodedToken = jwt.verify(token, "ekh12") as JwtPayload;

    if (!decodedToken.userId) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const userId = decodedToken.userId;
    const { productIDs } = req.body;

    await Promise.all(
      productIDs.map(async (productId: number) => {
        try {
          await prisma.userProduct.update({
            where: {
              id: productId,
              userId: userId,
            },
            data: {
              status: "processing",
            },
          });
          console.log(`Product ID ${productId} updated to processing`);
        } catch (error) {
          console.error(`Error updating product ID ${productId}:`, error);
        }
      })
    );

    res.status(200).json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating product status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const buyOrderPlacedNotificationAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const { orderId } = req.body;

    res.status(200).json({ message: "Notification sent to admin" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
