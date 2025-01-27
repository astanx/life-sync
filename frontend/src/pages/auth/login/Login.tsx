import { Logo } from "@/shared/ui/logo";
import { Input } from "@/shared/ui/input";

const Login = () => {
  return (
    <div>
      <div>
        <Logo />
        <div>
            <h3>Login to your account</h3>
            <p>Manage your time with LifeSync - plan your dreams, achieve your goals!</p>
            <form>
                <Input label="Email" type="email" placeholder="Email"/>
                <Input label="Password" type="password" placeholder="Password"/>
                
            </form>
        </div>
      </div>

      <div></div>
    </div>
  );
};

export { Login };
