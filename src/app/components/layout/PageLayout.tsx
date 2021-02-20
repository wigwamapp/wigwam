import React from "react";
import ContentContainer from "app/components/layout/ContentContainer";

const PageLayout: React.FC = ({ children }) => (
  <ContentContainer>
    <header className="flex items-center py-8">Header</header>

    <main>{children}</main>
  </ContentContainer>
);

export default PageLayout;
