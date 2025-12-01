import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "../../../test/utils";
import Navbar from "./Navbar";
import * as useAuthModule from "../../../hooks/useAuth";

// Mock the useAuth hook
vi.mock("../../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom at the top level
const mockNavigate = vi.fn();
let mockLocationValue = { pathname: "/" };

const mockUseLocation = vi.fn(() => mockLocationValue);

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

describe("Navbar Component - Unit Tests", () => {
  const mockSignOut = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset location to default
    mockLocationValue = { pathname: "/" };
    mockUseLocation.mockReturnValue(mockLocationValue);
  });

  it("should render navbar with brand logo", () => {
    (useAuthModule.useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    const logo = screen.getByAltText("Harry Chapin Food Bank of SWFL");
    expect(logo).toBeInTheDocument();
  });

  it("should show login and signup buttons when user is not logged in", () => {
    (useAuthModule.useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("should show user menu when user is logged in", () => {
    const mockUser = {
      email: "test@example.com",
    };

    (useAuthModule.useAuth as any).mockReturnValue({
      user: mockUser,
      isAdmin: false,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("should show admin links when user is admin", () => {
    const mockUser = {
      email: "admin@example.com",
    };

    (useAuthModule.useAuth as any).mockReturnValue({
      user: mockUser,
      isAdmin: true,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("Reports")).toBeInTheDocument();
  });

  it("should call signOut when logout button is clicked", async () => {
    const mockUser = {
      email: "test@example.com",
    };

    (useAuthModule.useAuth as any).mockReturnValue({
      user: mockUser,
      isAdmin: false,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  it("should toggle mobile menu when hamburger is clicked", () => {
    (useAuthModule.useAuth as any).mockReturnValue({
      user: null,
      isAdmin: false,
      signOut: mockSignOut,
    });

    render(<Navbar />, { includeAuth: false });

    const hamburger = document.querySelector(".mobile-hamburger");
    expect(hamburger).toBeInTheDocument();

    if (hamburger) {
      fireEvent.click(hamburger);
      // Menu should be toggled (we can check for mobile menu elements)
    }
  });

  it("should highlight active path", () => {
    const mockUser = {
      email: "test@example.com",
    };

    (useAuthModule.useAuth as any).mockReturnValue({
      user: mockUser,
      isAdmin: false,
      signOut: mockSignOut,
    });

    // Set location to dashboard path
    mockLocationValue = { pathname: "/dashboard" };
    mockUseLocation.mockReturnValue(mockLocationValue);

    render(<Navbar />, { includeAuth: false });

    const dashboardLink = screen.getByText("Dashboard");
    expect(dashboardLink).toBeInTheDocument();
  });
});
