import { useState, useEffect } from "react"
import { supabase } from "../../services/supabaseClient"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import DatePicker from "../../components/shared/DatePicker"
import { theme } from "../../constants/theme"

export default function SignupPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Basic Information
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [title, setTitle] = useState("");
  
  // Address Information
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [street3, setStreet3] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("United States");
  
  // Contact Information
  const [homePhone, setHomePhone] = useState("");
  const [homeOkToCall, setHomeOkToCall] = useState(false);
  const [workPhone, setWorkPhone] = useState("");
  const [workOkToCall, setWorkOkToCall] = useState(false);
  const [cellPhone, setCellPhone] = useState("");
  const [cellOkToCall, setCellOkToCall] = useState(false);
  
  // Demographic Information
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [education, setEducation] = useState("");
  const [occupation, setOccupation] = useState("");
  const [howHeardAboutUs, setHowHeardAboutUs] = useState("");
  
  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [otherSkills, setOtherSkills] = useState("");
  
  // Email Preferences
  const [emailNewsletter, setEmailNewsletter] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [emailScheduleReminders, setEmailScheduleReminders] = useState(true);
  const [emailEmergency, setEmailEmergency] = useState(true);
  
  // Emergency Contact
  const [emergencyFirstName, setEmergencyFirstName] = useState("");
  const [emergencyLastName, setEmergencyLastName] = useState("");
  const [emergencyHomePhone, setEmergencyHomePhone] = useState("");
  const [emergencyWorkPhone, setEmergencyWorkPhone] = useState("");
  const [emergencyCellPhone, setEmergencyCellPhone] = useState("");
  
  // Agreements
  const [agreeConfidentiality, setAgreeConfidentiality] = useState(false);
  const [agreeLiability, setAgreeLiability] = useState(false);
  const [agreePhotoConsent, setAgreePhotoConsent] = useState(false);
  const [agreeVolunteerAgreement, setAgreeVolunteerAgreement] = useState(false);
  
  // Form State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  // const [currentStep, setCurrentStep] = useState(1);

  const styles = {
    container: {
      minHeight: "calc(100vh - 72px)",
      backgroundColor: theme.colors.background,
      padding: "2rem 1rem",
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    formCard: {
      backgroundColor: theme.colors.white,
      padding: "3rem 2rem",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.lg,
      maxWidth: "900px",
      margin: "0 auto",
      border: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    header: {
      textAlign: "center" as const,
      marginBottom: "2.5rem",
      paddingBottom: "2rem",
      borderBottom: `2px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    logo: {
      fontSize: theme.typography.fontSize['3xl'],
      marginBottom: "1rem",
    } as React.CSSProperties,
    title: {
      fontSize: theme.typography.fontSize['3xl'],
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.75rem",
      lineHeight: theme.typography.lineHeight.tight,
    } as React.CSSProperties,
    subtitle: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.relaxed,
      maxWidth: "600px",
      margin: "0 auto",
    } as React.CSSProperties,
    progressBar: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "2.5rem",
      gap: "0.5rem",
    } as React.CSSProperties,
    progressStep: {
      flex: 1,
      height: "4px",
      backgroundColor: theme.colors.neutral[200],
      borderRadius: theme.borderRadius.full,
      transition: theme.transitions.base,
    } as React.CSSProperties,
    progressStepActive: {
      backgroundColor: theme.colors.primary,
    } as React.CSSProperties,
    form: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "2rem",
    } as React.CSSProperties,
    section: {
      paddingBottom: "2rem",
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    } as React.CSSProperties,
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.secondary,
      marginBottom: "0.75rem",
    } as React.CSSProperties,
    sectionDescription: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.secondary,
      marginBottom: "1.5rem",
      lineHeight: theme.typography.lineHeight.relaxed,
    } as React.CSSProperties,
    row: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
      alignItems: "start",
      "@media (max-width: 768px)": {
        gridTemplateColumns: "1fr",
      }
    } as React.CSSProperties,
    inputGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.5rem",
      width: "100%",
      minWidth: 0,
    } as React.CSSProperties,
    label: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
    } as React.CSSProperties,
    input: {
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      transition: theme.transitions.base,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    select: {
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      transition: theme.transitions.base,
      fontFamily: theme.typography.fontFamily,
      backgroundColor: theme.colors.white,
    } as React.CSSProperties,
    textarea: {
      padding: "0.75rem",
      fontSize: theme.typography.fontSize.base,
      border: `1px solid ${theme.colors.neutral[300]}`,
      borderRadius: theme.borderRadius.base,
      transition: theme.transitions.base,
      fontFamily: theme.typography.fontFamily,
      minHeight: "100px",
      resize: "vertical" as const,
    } as React.CSSProperties,
    checkboxGroup: {
      display: "flex",
      flexDirection: "column" as const,
      gap: "0.75rem",
    } as React.CSSProperties,
    checkboxRow: {
      display: "flex",
      alignItems: "flex-start",
      gap: "0.75rem",
    } as React.CSSProperties,
    checkbox: {
      width: "18px",
      height: "18px",
      cursor: "pointer",
      marginTop: "2px",
    } as React.CSSProperties,
    checkboxLabel: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.lineHeight.relaxed,
      cursor: "pointer",
    } as React.CSSProperties,
    skillsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "0.75rem",
    } as React.CSSProperties,
    agreementBox: {
      padding: "1.5rem",
      backgroundColor: theme.colors.neutral[50],
      borderRadius: theme.borderRadius.base,
      border: `1px solid ${theme.colors.neutral[200]}`,
      marginBottom: "1rem",
    } as React.CSSProperties,
    agreementText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.primary,
      lineHeight: theme.typography.lineHeight.relaxed,
      marginBottom: "1rem",
    } as React.CSSProperties,
    button: {
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      border: "none",
      padding: "1rem 2rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.semibold,
      cursor: "pointer",
      transition: theme.transitions.base,
      boxShadow: theme.shadows.sm,
      fontFamily: theme.typography.fontFamily,
    } as React.CSSProperties,
    buttonDisabled: {
      backgroundColor: theme.colors.neutral[400],
      cursor: "not-allowed",
    } as React.CSSProperties,
    error: {
      backgroundColor: "#fee",
      color: "#c00",
      padding: "1rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.sm,
      border: "1px solid #fcc",
    } as React.CSSProperties,
    success: {
      backgroundColor: "#efe",
      color: "#060",
      padding: "1.5rem",
      borderRadius: theme.borderRadius.base,
      fontSize: theme.typography.fontSize.base,
      border: "1px solid #cfc",
      textAlign: "center" as const,
    } as React.CSSProperties,
    footer: {
      marginTop: "2rem",
      textAlign: "center" as const,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.fontSize.sm,
    } as React.CSSProperties,
    loadingContainer: {
      minHeight: "calc(100vh - 72px)",
      display: "flex",
      flexDirection: "column" as const,
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
    } as React.CSSProperties,
    spinner: {
      border: `3px solid ${theme.colors.neutral[300]}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      animation: "spin 1s linear infinite",
    } as React.CSSProperties,
    hint: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.text.secondary,
      marginTop: "0.25rem",
    } as React.CSSProperties,
    link: {
      color: theme.colors.primary,
      textDecoration: "none",
      fontWeight: theme.typography.fontWeight.semibold,
    } as React.CSSProperties,
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  const skillsOptions = [
    "Attorney / Legal Professional",
    "Bilingual",
    "Bloomerang Experience",
    "Doctor / Medical Professional",
    "Farming / Agricultural",
    "Food Industry Management",
    "Food/Bev Management",
    "Information Technology",
    "Logistics / Warehouse Management",
    "Professional Fundraising Experience",
    "Social Media Campaign Management",
    "Volgistics Experience"
  ];

  const toggleSkill = (skill: string) => {
    setSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!agreeVolunteerAgreement) {
      setError("You must agree to the volunteer policies to continue");
      setLoading(false);
      return;
    }

    // Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const newUser = data.user;
    if (newUser) {
      // Wait a moment for any database triggers to complete
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if profile already exists (created by trigger)
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", newUser.id)
        .single();

      console.log("Existing profile check:", existingProfile, checkError);

      // Create comprehensive profile with all the collected data
      const addressData = {
        street1,
        street2,
        street3,
        city,
        state,
        zipCode,
        country
      };

      // Compile all skills including custom ones
      const allSkills = [...skills];
      if (otherSkills.trim()) {
        allSkills.push(otherSkills.trim());
      }

      // Add additional data as tags for now
      const additionalInfo = [];
      if (nickname) additionalInfo.push(`Nickname: ${nickname}`);
      if (title) additionalInfo.push(`Title: ${title}`);
      if (gender) additionalInfo.push(`Gender: ${gender}`);
      if (education) additionalInfo.push(`Education: ${education}`);
      if (occupation) additionalInfo.push(`Occupation: ${occupation}`);
      if (howHeardAboutUs) additionalInfo.push(`Heard from: ${howHeardAboutUs}`);

      // Build the profile data
      const profileUpdateData: any = {
        email,
        first_name: firstName,
        last_name: lastName,
        phone: cellPhone || homePhone || workPhone || null,
        emergency_contact_name: `${emergencyFirstName} ${emergencyLastName}`.trim() || null,
        emergency_contact_phone: emergencyCellPhone || emergencyHomePhone || emergencyWorkPhone || null,
        date_of_birth: dateOfBirth || null,
        address: addressData,
        status: "pending", // Will be activated after background check
        role: "volunteer", // Set role as volunteer
        updated_at: new Date().toISOString()
      };

      // Only add skills if there are any
      if (allSkills.length > 0) {
        profileUpdateData.skills = allSkills;
      }

      // Only add tags if there are any
      if (additionalInfo.length > 0) {
        profileUpdateData.tags = additionalInfo;
      }

      console.log("Profile data to save:", profileUpdateData);

      let profileError = null;

      if (existingProfile) {
        // Update existing profile
        console.log("Updating existing profile...");
        const { error } = await supabase
          .from("profiles")
          .update(profileUpdateData)
          .eq("id", newUser.id);
        profileError = error;
      } else {
        // Insert new profile
        console.log("Inserting new profile...");
        const { error } = await supabase
          .from("profiles")
          .insert({
            id: newUser.id,
            ...profileUpdateData
          });
        profileError = error;
      }

      if (profileError) {
        console.error("Error saving profile:", profileError);
        console.error("Profile data that failed:", profileUpdateData);
        setError(`Account created but profile setup failed: ${profileError.message}. Please contact support.`);
        setLoading(false);
        return;
      }

      console.log("Profile saved successfully!");
      setSuccess(true);
      setLoading(false);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 3000);
    }
  };

  if (authLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontFamily: theme.typography.fontFamily, color: theme.colors.text.secondary }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <div style={styles.header}>
          <div style={styles.logo}>🍽</div>
          <h1 style={styles.title}>Individual Volunteer Registration Form</h1>
          <p style={styles.subtitle}>
            Thank you for your interest in becoming a Harry Chapin Food Bank of SWFL volunteer! 
            Once your registration is processed, you will receive an email with more information about volunteering and how to get started.
          </p>
        </div>
        
        {success ? (
          <div style={styles.success}>
            <strong>✓ Success!</strong>
            <p style={{ marginTop: "0.5rem" }}>
              Your registration has been submitted! You will receive an email with next steps. 
              Redirecting to dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={styles.form}>
            {error && (
              <div style={styles.error}>
                <strong>Error:</strong> {error}
              </div>
            )}
            
            {/* Name and Contact Information */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Name and Contact Information</h2>
              
              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="firstName" style={styles.label}>First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="lastName" style={styles.label}>Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="nickname" style={styles.label}>Nickname</label>
                  <input
                    id="nickname"
                    type="text"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="title" style={styles.label}>Title</label>
                  <input
                    id="title"
                    type="text"
                    placeholder="e.g., Mr., Mrs., Dr."
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="email" style={styles.label}>Email Address *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Address</h2>
              
              <div style={styles.inputGroup}>
                <label htmlFor="street1" style={styles.label}>Street 1</label>
                <input
                  id="street1"
                  type="text"
                  value={street1}
                  onChange={e => setStreet1(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="street2" style={styles.label}>Street 2</label>
                  <input
                    id="street2"
                    type="text"
                    value={street2}
                    onChange={e => setStreet2(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="street3" style={styles.label}>Street 3</label>
                  <input
                    id="street3"
                    type="text"
                    value={street3}
                    onChange={e => setStreet3(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="city" style={styles.label}>City</label>
                  <input
                    id="city"
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="state" style={styles.label}>State/Province</label>
                  <input
                    id="state"
                    type="text"
                    placeholder="FL"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="zipCode" style={styles.label}>Zip/Postal Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    value={zipCode}
                    onChange={e => setZipCode(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="country" style={styles.label}>Country</label>
                  <input
                    id="country"
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Phone Numbers */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Phone Numbers</h2>
              
              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="homePhone" style={styles.label}>Home Phone</label>
                  <input
                    id="homePhone"
                    type="tel"
                    placeholder="(239) 555-0123"
                    value={homePhone}
                    onChange={e => setHomePhone(e.target.value)}
                    style={styles.input}
                  />
                  <div style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="homeOkToCall"
                      checked={homeOkToCall}
                      onChange={e => setHomeOkToCall(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <label htmlFor="homeOkToCall" style={styles.checkboxLabel}>
                      Ok to call
                    </label>
                  </div>
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="workPhone" style={styles.label}>Work Phone</label>
                  <input
                    id="workPhone"
                    type="tel"
                    placeholder="(239) 555-0123"
                    value={workPhone}
                    onChange={e => setWorkPhone(e.target.value)}
                    style={styles.input}
                  />
                  <div style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id="workOkToCall"
                      checked={workOkToCall}
                      onChange={e => setWorkOkToCall(e.target.checked)}
                      style={styles.checkbox}
                    />
                    <label htmlFor="workOkToCall" style={styles.checkboxLabel}>
                      Ok to call
                    </label>
                  </div>
                </div>
              </div>

              <div style={{ ...styles.inputGroup, maxWidth: "49%" }}>
                <label htmlFor="cellPhone" style={styles.label}>Cell Phone</label>
                <input
                  id="cellPhone"
                  type="tel"
                  placeholder="(239) 555-0123"
                  value={cellPhone}
                  onChange={e => setCellPhone(e.target.value)}
                  style={styles.input}
                />
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="cellOkToCall"
                    checked={cellOkToCall}
                    onChange={e => setCellOkToCall(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="cellOkToCall" style={styles.checkboxLabel}>
                    Ok to call
                  </label>
                </div>
              </div>
            </div>

            {/* Demographic Information */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Demographic Information</h2>
              <p style={styles.sectionDescription}>
                This information helps us better understand our volunteer community.
              </p>
              
              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <DatePicker
                    label="Date of Birth"
                    value={dateOfBirth}
                    onChange={setDateOfBirth}
                    placeholder="Select your date of birth"
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="gender" style={styles.label}>Gender</label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="education" style={styles.label}>Education</label>
                  <select
                    id="education"
                    value={education}
                    onChange={e => setEducation(e.target.value)}
                    style={styles.select}
                  >
                    <option value="">Select...</option>
                    <option value="high-school">High School</option>
                    <option value="some-college">Some College</option>
                    <option value="associates">Associate's Degree</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="doctorate">Doctorate</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="occupation" style={styles.label}>Occupation</label>
                  <input
                    id="occupation"
                    type="text"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label htmlFor="howHeardAboutUs" style={styles.label}>How did you hear about us?</label>
                <select
                  id="howHeardAboutUs"
                  value={howHeardAboutUs}
                  onChange={e => setHowHeardAboutUs(e.target.value)}
                  style={styles.select}
                >
                  <option value="">Select...</option>
                  <option value="website">Website</option>
                  <option value="social-media">Social Media</option>
                  <option value="friend">Friend or Family</option>
                  <option value="community-event">Community Event</option>
                  <option value="news">News/Media</option>
                  <option value="school">School/University</option>
                  <option value="church">Church/Religious Organization</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Skills */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Skills (Optional)</h2>
              <p style={styles.sectionDescription}>
                Please select any skills that may be valuable to our organization.
              </p>
              
              <div style={styles.skillsGrid}>
                {skillsOptions.map(skill => (
                  <div key={skill} style={styles.checkboxRow}>
                    <input
                      type="checkbox"
                      id={skill}
                      checked={skills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      style={styles.checkbox}
                    />
                    <label htmlFor={skill} style={styles.checkboxLabel}>
                      {skill}
                    </label>
                  </div>
                ))}
              </div>

              <div style={{ ...styles.inputGroup, marginTop: "1rem" }}>
                <label htmlFor="otherSkills" style={styles.label}>
                  Other skills not listed
                </label>
                <textarea
                  id="otherSkills"
                  value={otherSkills}
                  onChange={e => setOtherSkills(e.target.value)}
                  style={styles.textarea}
                  placeholder="Describe any other skills that may be valuable..."
                />
              </div>
            </div>

            {/* Email Preferences */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Email Preferences</h2>
              <p style={styles.sectionDescription}>
                Select the types of emails you would like to receive.
              </p>
              
              <div style={styles.checkboxGroup}>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="emailNewsletter"
                    checked={emailNewsletter}
                    onChange={e => setEmailNewsletter(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="emailNewsletter" style={styles.checkboxLabel}>
                    <strong>Electronic newsletters</strong> - Volunteer Vibes newsletter written by volunteers
                  </label>
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={emailNotifications}
                    onChange={e => setEmailNotifications(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="emailNotifications" style={styles.checkboxLabel}>
                    <strong>Notifications</strong> - Important information like closings and cancellations (Recommended)
                  </label>
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="emailScheduleReminders"
                    checked={emailScheduleReminders}
                    onChange={e => setEmailScheduleReminders(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="emailScheduleReminders" style={styles.checkboxLabel}>
                    <strong>Schedule reminders</strong> - Reminders about upcoming volunteer assignments
                  </label>
                </div>

                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="emailEmergency"
                    checked={emailEmergency}
                    onChange={e => setEmailEmergency(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="emailEmergency" style={styles.checkboxLabel}>
                    <strong>Emergency operations</strong> - Hurricane and natural disaster information (Recommended)
                  </label>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Emergency Contact</h2>
              <p style={styles.sectionDescription}>
                In case of emergency, who should we contact?
              </p>
              
              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="emergencyFirstName" style={styles.label}>First Name</label>
                  <input
                    id="emergencyFirstName"
                    type="text"
                    value={emergencyFirstName}
                    onChange={e => setEmergencyFirstName(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="emergencyLastName" style={styles.label}>Last Name</label>
                  <input
                    id="emergencyLastName"
                    type="text"
                    value={emergencyLastName}
                    onChange={e => setEmergencyLastName(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="emergencyHomePhone" style={styles.label}>Home Phone</label>
                  <input
                    id="emergencyHomePhone"
                    type="tel"
                    value={emergencyHomePhone}
                    onChange={e => setEmergencyHomePhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="emergencyWorkPhone" style={styles.label}>Work Phone</label>
                  <input
                    id="emergencyWorkPhone"
                    type="tel"
                    value={emergencyWorkPhone}
                    onChange={e => setEmergencyWorkPhone(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ ...styles.inputGroup, maxWidth: "49%" }}>
                <label htmlFor="emergencyCellPhone" style={styles.label}>Cell Phone</label>
                <input
                  id="emergencyCellPhone"
                  type="tel"
                  value={emergencyCellPhone}
                  onChange={e => setEmergencyCellPhone(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {/* VicNet Account (Password) */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>Create Your Account</h2>
              <p style={styles.sectionDescription}>
                Create a secure password to manage your volunteer profile online.
              </p>
              
              <div style={styles.row} className="signup-row">
                <div style={styles.inputGroup}>
                  <label htmlFor="password" style={styles.label}>Password *</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={styles.input}
                    required
                    minLength={8}
                  />
                  <p style={styles.hint}>At least 8 characters, mixture of letters and numbers</p>
                </div>
                
                <div style={styles.inputGroup}>
                  <label htmlFor="confirmPassword" style={styles.label}>Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    required
                    minLength={8}
                  />
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div>
              <h2 style={styles.sectionTitle}>Consent Forms and Agreements</h2>
              
              <div style={styles.agreementBox}>
                <h3 style={{ ...styles.label, marginBottom: "0.75rem" }}>Statement of Confidentiality</h3>
                <p style={styles.agreementText}>
                  Harry Chapin Food Bank of SWFL requires that strict confidentiality be maintained with respect to all 
                  information obtained by volunteers concerning the organization, as well as the clients and others they serve. 
                  The volunteer shall not disclose any information obtained in the course of his/her volunteer placement 
                  to any third parties without prior written consent from Harry Chapin Food Bank of SWFL.
                </p>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="agreeConfidentiality"
                    checked={agreeConfidentiality}
                    onChange={e => setAgreeConfidentiality(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="agreeConfidentiality" style={styles.checkboxLabel}>
                    I understand and agree to uphold confidentiality
                  </label>
                </div>
              </div>

              <div style={styles.agreementBox}>
                <h3 style={{ ...styles.label, marginBottom: "0.75rem" }}>Release of Liability</h3>
                <p style={styles.agreementText}>
                  I understand that any work performed as a volunteer is at my own risk. I hereby agree to release 
                  and discharge Harry Chapin Food Bank of SWFL, its officers, directors, employees, agents, and volunteers 
                  from all claims, suits, demands, and actions for injuries sustained to my person and/or property.
                </p>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="agreeLiability"
                    checked={agreeLiability}
                    onChange={e => setAgreeLiability(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="agreeLiability" style={styles.checkboxLabel}>
                    I agree to the release of liability
                  </label>
                </div>
              </div>

              <div style={styles.agreementBox}>
                <h3 style={{ ...styles.label, marginBottom: "0.75rem" }}>Photo Consent</h3>
                <p style={styles.agreementText}>
                  I agree to allow Harry Chapin Food Bank of SWFL unrestricted use of photographs taken of me in the course 
                  of participation in activities sponsored by Harry Chapin Food Bank of SWFL, to be used only in connection 
                  with official publications and documents.
                </p>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="agreePhotoConsent"
                    checked={agreePhotoConsent}
                    onChange={e => setAgreePhotoConsent(e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor="agreePhotoConsent" style={styles.checkboxLabel}>
                    I agree to photo consent
                  </label>
                </div>
              </div>

              <div style={styles.agreementBox}>
                <h3 style={{ ...styles.label, marginBottom: "0.75rem" }}>Volunteer Agreement</h3>
                <p style={styles.agreementText}>
                  By checking this box, I agree to all policies and waivers set forth by Harry Chapin Food Bank 
                  of SWFL, including a background check which will be performed after my application 
                  has been received.
                </p>
                <div style={styles.checkboxRow}>
                  <input
                    type="checkbox"
                    id="agreeVolunteerAgreement"
                    checked={agreeVolunteerAgreement}
                    onChange={e => setAgreeVolunteerAgreement(e.target.checked)}
                    style={styles.checkbox}
                    required
                  />
                  <label htmlFor="agreeVolunteerAgreement" style={styles.checkboxLabel}>
                    <strong>I Agree *</strong>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !agreeVolunteerAgreement}
              style={{
                ...styles.button,
                ...(loading || !agreeVolunteerAgreement ? styles.buttonDisabled : {})
              }}
              onMouseEnter={(e) => {
                if (!loading && agreeVolunteerAgreement) {
                  e.currentTarget.style.backgroundColor = '#c72e3a'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && agreeVolunteerAgreement) {
                  e.currentTarget.style.backgroundColor = theme.colors.primary
                  e.currentTarget.style.transform = 'translateY(0)'
                }
              }}
            >
              {loading ? "Submitting Registration..." : "Submit Registration"}
            </button>
          </form>
        )}
        
        <div style={styles.footer}>
          <p>
            Already have an account?{" "}
            <Link to="/login" style={styles.link}>
              Login here
            </Link>
          </p>
          <p style={{ marginTop: "0.5rem" }}>
            Need assistance? Contact us at{" "}
            <a href="mailto:volunteering@harrychapinfoodbank.org" style={styles.link}>
              volunteering@harrychapinfoodbank.org
            </a>
          </p>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .signup-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
