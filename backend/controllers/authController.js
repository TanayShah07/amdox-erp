export const loginUser = async (req, res) => {

  try {

    const { email, password } =
      req.body;

    console.log(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: "dummy-token-123",
      role: "employee",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};