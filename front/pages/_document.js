// html 역할

import React from 'react';
import Document, { Main, NextScript } from 'next/document';
import { Helmet } from 'react-helmet';
import { ServerStyleSheet} from 'styled-components';
import PropTypes from 'prop-types';


class MyDocument extends Document {
    static getInitialProps(context) {
        const sheet = new ServerStyleSheet();  // styedComponent SSR
        const page = context.renderPage((App) => (props) => sheet.collectStyles(<App {...props} />));   // react-helemt SSR
        const styleTags = sheet.getStyleElement();
        return { ...page, helmet: Helmet.renderStatic(), styleTags }
    }

    render() {
        const { htmlAttributes, bodyAttributes, ...helmet } = this.props.helmet;
        const htmlAttrs = htmlAttributes.toComponent();
        const bodyAttrs = bodyAttributes.toComponent();

        return (
            <html {...htmlAttrs}>
                <head>
                    {this.props.styleTags}
                    {Object.values(helmet).map( el => el.toComponent())}
                </head>
                <body {...bodyAttrs}>
                    {/* Main이 app.js */}
                    <Main />
                    <NextScript />
                </body>
            </html>
        )
    }
}

MyDocument.propTypes = {
    helmet: PropTypes.object.isRequired,
    styleTags: PropTypes.object.isRequired,
}

export default MyDocument;