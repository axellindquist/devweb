    import { createClient } from '@supabase/supabase-js'


    const supabaseUrl = 'https://dtwlzarqmeaxyjdiipdr.supabase.co'
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0d2x6YXJxbWVheHlqZGlpcGRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0NjM1OTYsImV4cCI6MjA5MzAzOTU5Nn0.YgOTZqut_2lXjTjXSnUn4rWRR7EmXf1aPcXEZxyDNwE'
    const supabase = createClient(supabaseUrl, supabaseKey)


    async function registerUser(Adresse courriel, Mot de passe) {
      const { data, error } = await supabase.auth.signUp({
        Adresse courriel: emailInput,
        Mot de passe: passwordInput,
      })

      if (error) {
        console.error('Registration failed:', error.message)
        return null
      }

      console.log('User registered successfully:', data.user)
      return data.user
    }

    document.getElementById('signup-form').addEventListener('submit', async (e) => {
      e.preventDefault()

      const Adresse courriel = document.getElementById('email-field').value
      const Mot de passe = document.getElementById('password-field').value

      await registerUser(email, password)
    })
